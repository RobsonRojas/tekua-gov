## Context

A motivação está em `proposal.md` (Why) e o comportamento esperado em `specs/notifications-hub/spec.md`. O estado atual relevante:

- O trigger `tr_notify_activity_insert` (`supabase/migrations/20260428180000_...` com a correção de robustez em `..._fix_notification_trigger_robustness.sql`) dispara em todo `INSERT` de `public.activities` e envia, via `pg_net`, o evento `activity.created` para a Edge Function `notify-engine`, com `payload = row_to_json(NEW)`.
- `notify-engine` já contém o template de `activity.created` ("Nova Oportunidade"/`/work`) e resolve destinatários como `payload.executor_ids` ou, na ausência, todos os membros.
- **Defeito de entrega:** o passo de gravar a notificação in-app faz `insert` em `notifications` usando a coluna `content` (inexistente) e strings simples nos campos JSONB `title`/`message`. O insert falha; como o processamento usa `Promise.all` sobre os destinatários, a rejeição de um destinatário aborta o lote inteiro e a resposta retorna erro — logo, nem in-app, nem push, nem email são entregues.
- O schema real de `notifications` é `title JSONB`, `message JSONB`, `type TEXT`, `link TEXT`, `is_read`, `created_at` (+ `data JSONB`). O RPC `create_notification` e os renderizadores do frontend já usam o formato i18n `{ pt, en }`: `notif.title[lang] || notif.title.pt`.

## Goals / Non-Goals

**Goals:**
- Fazer a notificação de demanda criada realmente ser entregue (in-app + push + email quando configurados).
- Selecionar destinatários corretamente: executores designados quando existirem; caso contrário, membros excluindo o criador.
- Tornar a entrega resiliente a falhas isoladas por destinatário.

**Non-Goals:**
- Redesenhar a arquitetura de notificações, adicionar preferências de opt-out ou alterar RLS/`notifications`.
- Criar novos tipos de evento ou novos canais.
- Alterar o mecanismo de disparo (trigger `activity.created`) ou criar migrate.
- Reprocessar/backfill de notificações históricas que não foram entregues.

## Decisions

- **Corrigir o insert compartilhado no `notify-engine`, não casos isolados.** O insert in-app é um único caminho usado por `activity.created`, `activity.claimed`, `activity.submitted`, `activity.completed`, `activity.interaction_mention` e `governance.agenda_created`. Corrigir esse caminho destrava a demanda criada e, de forma estrita, melhora os demais eventos que hoje falham. Alternativa considerada: criar um insert específico só para `activity.created` — rejeitada por deixar os outros eventos quebrados.
- **Persistir `title`/`message` como JSONB i18n `{ pt, en }`.** É o formato que o frontend já renderiza e que o RPC `create_notification` já grava. Alternativa considerada: adaptar o frontend para aceitar strings simples — rejeitada por ampliar superfície e arriscar outros produtores de notificação.
- **Seleção de destinatários.** Preferir `payload.executor_ids`; na ausência, todos os membros menos o `requester_id`. Alternativa considerada: notificar sempre todos os membros — rejeitada por gerar ruído e notificar o próprio criador. Os payloads de push/email permanecem strings simples (não mudam de formato).
- **Isolamento por destinatário.** Envolver o processamento de cada destinatário em tratamento de erro individual (ex.: `Promise.allSettled` ou try/catch por destinatário) para que a falha de um não aborte os demais. Alternativa considerada: manter `Promise.all` — rejeitada por ser exatamente a causa do efeito "tudo ou nada".
- **Manter o trigger do banco como está.** O disparo já é correto; o defeito é exclusivamente da Edge Function. Nenhuma migrate é necessária.

## Risks / Trade-offs

- **Consumidores de push/email podem depender de strings simples** → manter os payloads de push/email com `pushTitle`/`pushBody` como strings; apenas o registro em `notifications` usa JSONB i18n.
- **Corrigir o insert compartilhado altera o comportamento de outros eventos** → esses eventos hoje falham integralmente; a mudança apenas os torna funcionais. Validar que o shape gravado espelha o de `create_notification` (`title`/`message` JSONB i18n, `type`, `link`).
- **Broadcast para todos os membros pode ter custo em bases maiores** → aceitável na escala atual; o caminho com executores designados evita o broadcast. Evolução futura pode paginar/lotear.
- **Trigger dispara em qualquer `INSERT` de `activities` (inclusive submissões via `submit_activity`, já `open`)** → intencional: toda criação de atividade representa uma nova oportunidade de demanda; mantém-se o comportamento de `activity.created`.

## Migration Plan

- Deploy da Edge Function `notify-engine` atualizada (ex.: `supabase functions deploy notify-engine`). Sem migrate de banco.
- Rollback: redeploy da versão anterior da função; não há mudança de schema nem de dados.
