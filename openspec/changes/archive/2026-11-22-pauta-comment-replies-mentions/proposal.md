## Why

Hoje a página de detalhe da pauta (`TopicDetail`) aceita apenas comentários soltos em lista linear: não é possível responder a um comentário específico nem chamar a atenção de um membro. Em debates de governança isso faz as discussões se perderem. O fluxo de menções já existe nos comentários de tarefas (`TaskInteractions` + `activity.interaction_mention`) e pode ser reaproveitado.

## What Changes

- Comentários de pauta passam a poder ser **respostas** a outro comentário (encadeamento de um nível, exibido sob o comentário pai).
- Ao escrever um comentário ou resposta, digitar `@` abre uma busca de membros; os membros escolhidos ficam **mencionados** (guardados por ID) e o nome aparece destacado no texto.
- Membros mencionados recebem notificação in-app/push/e-mail (novo evento `governance.topic_mention`); o autor do comentário pai recebe notificação de resposta (`governance.topic_reply`).
- Comentar continua permitido a qualquer membro autenticado; em pautas `closed` os comentários continuam visíveis mas não aceitam novos comentários nem respostas.
- Migração: `topic_comments.parent_id` (FK para o próprio comentário, `ON DELETE CASCADE`) e `topic_comments.mentioned_user_ids UUID[]`.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `voting-system`: nova exigência de comentários em pautas com respostas, menções de membros e notificações correspondentes.

## Impact

- Banco: migração em `topic_comments`; RLS de insert já exige `user_id = auth.uid()`.
- `supabase/functions/api-governance` (`addComment`, `fetchTopicDetail`), `supabase/functions/notify-engine` (2 eventos novos).
- `src/pages/TopicDetail.tsx` (+ extrair o seletor de menção de `TaskInteractions` para componente compartilhado), traduções pt/en, testes.
- Deploy da edge function e aplicação da migração em produção.
