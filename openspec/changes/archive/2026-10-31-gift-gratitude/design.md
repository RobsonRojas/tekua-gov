## Context

Ver `proposal.md` — Why. Estado atual que condiciona a abordagem:

- O registro de uso é feito por `api-gifts.recordUsage`, que chama a RPC `award_gift_points(p_gift_id, p_consumer_id)`. Essa RPC insere em `gift_usages` (colunas `id`, `gift_id`, `consumer_id`, `created_at`) e incrementa `wallets.gift_points` do provedor. Não há notificação nem email nesse fluxo.
- `notify-engine` envia notificação in-app, push e email a partir de eventos nomeados, mas não conhece eventos de dádiva.
- Já existem funções agendadas de email e recompensa (`cron_retry_emails`, `cron-rewards-notify`), que servem de modelo para o lembrete semanal.
- O card da dádiva (`src/pages/GiftsArea.tsx`) renderiza a descrição com `SafeMarkdown contained`. Esse componente trata largura e quebra de palavra, mas **não** limita altura, então a causa do texto cortado ainda não foi confirmada e precisa ser reproduzida.

## Goals / Non-Goals

**Goals:**
- Permitir agradecimento opcional no registro de uso, sem alterar a contabilização de pontos.
- Lembrar semanalmente quem utilizou dádivas e não agradeceu, por email e notificação.
- Publicar as gratidões em um dashboard público com privacidade por registro.
- Manter ingratidões sempre privadas.

**Non-Goals:**
- Não exibir agradecimentos no mural.
- Não moderar automaticamente o texto dos agradecimentos nesta mudança (filtragem de conteúdo fica para depois).
- Não tornar ingratidões públicas, nem criar um fluxo de revisão delas.
- Não alterar o cálculo de Pontos de Dádiva nem a carteira.

## Decisions

**1. Colunas novas em `gift_usages`.**
- *Decisão:* adicionar `thanks_message text` (limite de 280 caracteres, validado no banco com `CHECK`), `thanks_emojis text[]` (lista curta de emojis permitidos), `sentiment text` com valores `gratitude` ou `ingratitude`, default `gratitude`, e `is_public boolean` com default `true`. Uma restrição garante que `sentiment = 'ingratitude'` implique `is_public = false`.
- *Por quê:* a regra de ingratidão privada fica garantida no banco, não só na interface.
- *Alternativa rejeitada:* tabela separada de gratidões. Duplicaria a relação com o uso e complicaria a regra de "um uso, um agradecimento".

**2. RPC de uso passa a aceitar o agradecimento.**
- *Decisão:* `award_gift_points` ganha parâmetros opcionais de agradecimento. A função continua incrementando os pontos da mesma forma. A validação de tamanho acontece antes da inserção, para que uma mensagem inválida não registre o uso.
- *Alternativa rejeitada:* segunda chamada para gravar o agradecimento depois do uso. Abriria uma janela em que o uso existe sem o agradecimento e sem garantia de atomicidade.

**3. Edição posterior por ação dedicada.**
- *Decisão:* nova ação de `api-gifts` que atualiza o agradecimento de um uso, restrita ao `consumer_id` autenticado (checado no banco com RLS, não só no código).
- *Por quê:* o lembrete semanal depende de o membro conseguir agradecer depois.

**4. Lembrete semanal pela função agendada.**
- *Decisão:* uma função agendada semanal seleciona os membros com usos dos últimos 7 dias sem agradecimento, e dispara um evento `gift.gratitude_reminder` ao `notify-engine`. Esse evento grava a notificação in-app, envia push e email, no mesmo padrão dos outros eventos.
- *Limite de uma vez por semana:* registro de envio por membro e semana, para que execuções repetidas não gerem duplicidade.
- *Alternativa rejeitada:* lembrar imediatamente, a cada uso. O texto pede resposta "essa semana", e um lembrete por uso geraria spam.

**5. Dashboard público com filtro no banco.**
- *Decisão:* a listagem pública é uma consulta que filtra `is_public = true` e `sentiment = 'gratitude'`, feita pela função da API. A RLS de leitura pública de `gift_usages` continua restrita às colunas expostas, e o nome do autor vem do perfil, com o mesmo tratamento das demais listas.
- *Por quê:* filtrar só na interface deixaria registros privados acessíveis por chamada direta.

**6. Privacidade por registro.**
- *Decisão:* o autor altera `is_public` do próprio registro, por ação dedicada. Ingratidões ignoram essa alteração e permanecem privadas.

**7. Texto cortado no card.**
- *Decisão:* antes de qualquer correção, reproduzir o corte no navegador com uma dádiva de descrição longa, para identificar se é altura fixa, `overflow` ou o título. A correção será feita no componente do card, sem mudar o conteúdo.

## Risks / Trade-offs

- **Conteúdo ofensivo em agradecimentos públicos** → mitigado parcialmente pelo limite de tamanho e pelo lista restrita de emojis. A moderação automática fica como não-objetivo; quem registra pode editar ou tornar privado, e a moderação existente de atividades continua separada.
- **Classificação de ingratidão** → a regra "ingratidões privadas" depende de o próprio membro marcar o sentimento. Não há detecção automática. Isso precisa ser confirmado com o responsável antes do deploy (ver tarefa 5.1).
- **Duplicidade de lembretes** → mitigado pelo registro de envio semanal por membro.
- **Falha no email** → a notificação in-app continua valendo, e a falha fica registrada.
- **Migração em produção com histórico de migrações fora de sincronia** → mesmo cuidado já adotado no change `fix-requester-executor-confirm-button`: aplicar apenas a migração nova, sem `db push`.

## Migration Plan

1. Aplicar a migração de colunas e constraints em `gift_usages`, com valores default que preservam os usos existentes (`sentiment = 'gratitude'`, `is_public = true`, sem agradecimento).
2. Publicar `api-gifts`, `award_gift_points` e `notify-engine`.
3. Agendar a função semanal.
4. Publicar o frontend (campo opcional, edição, dashboard e correção do card).
5. **Rollback:** desativar o agendamento semanal, reverter o frontend e a `api-gifts`. As colunas novas podem ser mantidas, pois têm default e não afetam os usos existentes.

## Open Questions

- A palavra "ingratidões" do pedido original foi interpretada como registros de sentimento negativo, que ficam privados. Se a intenção for outra (por exemplo, esconder mensagens com conteúdo negativo), o modelo de dados muda. Precisa de confirmação do responsável antes de implementar a tarefa 2.1.
