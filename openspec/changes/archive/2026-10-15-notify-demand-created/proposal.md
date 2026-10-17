## Why

Quando um membro cria uma demanda (atividade) no Work Wall, nenhuma notificação é entregue aos demais membros. A infraestrutura existe (trigger `activity.created` no banco + Edge Function `notify-engine`), porém o caminho de entrega está quebrado: o `notify-engine` insere a notificação in-app usando uma coluna `content` que não existe e strings simples nos campos JSONB `title`/`message`. O evento falha de ponta a ponta, interrompendo também push e email.

## What Changes

- Corrigir o caminho compartilhado de entrega no `notify-engine` para gravar notificações in-app no formato correto: colunas `title`/`message` como JSONB i18n (`{ pt, en }`), sem uso da coluna inexistente `content`. Isso destrava o evento `activity.created` (e os demais eventos que compartilham o mesmo insert quebrado: `activity.claimed`, `activity.submitted`, `activity.completed`, `activity.interaction_mention`, `governance.agenda_created`).
- Garantir que o evento `activity.created` notifique os destinatários relevantes: os `executor_ids` escolhidos quando informados; caso contrário, os membros da plataforma **excluindo o criador da demanda** (que já sabe da criação).
- Manter a entrega por push e email para o evento `activity.created` funcionando após a correção do insert.

## Capabilities

### New Capabilities

- Nenhuma capability nova introduzida.

### Modified Capabilities

- `notifications-hub`: Novo requisito de comportamento — quando uma demanda (atividade) é criada, os membros relevantes recebem uma notificação in-app (com push/email quando configurados), incluindo `title`/`message` no formato i18n esperado pelo frontend.

## Impact

- **Edge Function `notify-engine`**: correção do insert de notificações in-app e ajuste da seleção de destinatários em `activity.created`.
- **Banco de Dados**: sem migrate nova — a tabela `notifications` já possui `title JSONB`, `message JSONB`, `type`, `link`; o trigger `tr_notify_activity_insert` já despacha `activity.created` via `pg_net`.
- **Frontend**: sem alterações — os renderizadores (`pages/Notifications.tsx`, `components/NotificationCenter`) já esperam `title`/`message` como objetos JSONB `{ pt, en }`.