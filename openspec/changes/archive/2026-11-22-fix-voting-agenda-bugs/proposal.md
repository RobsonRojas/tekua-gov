## Why

Três bugs críticos de usabilidade e integridade foram identificados na tela de detalhe de pauta (`TopicDetail`): votantes não conseguem desfazer um voto registrado; o campo de menção de membros no comentário não filtra pela query digitada; e o botão "Enviar" de comentário falha com erro 400 (`null value in column "content_old"`), causado por um trigger ou RLS legado que ainda exige a coluna renomeada.

## What Changes

- **Desfazer voto:** Os botões Sim / Não / Abstenção DEVEM permanecer clicáveis quando `hasVoted === true`. Clicar no voto já selecionado (mesmo option) cancela o voto; clicar em outra opção muda o voto. O backend já faz `upsert`, então só é necessário: (a) expor o voto atual do usuário via `fetchTopicDetail`, (b) adicionar endpoint `removeVote` no `api-governance`, e (c) ajustar a lógica de `handleVote` no frontend.
- **Filtro de menção:** A Edge Function `api-members/fetchUsers` ignora o parâmetro `search` recebido — a query não aplica filtro `ilike` em `full_name`. Corrigir adicionando o filtro condicional na construção da query.
- **Erro ao comentar — `content_old`:** A tabela `topic_comments` foi migrada (coluna `content` renomeada para `content_old`, nova coluna JSONB `content`), mas algum trigger/policy ainda referencia `content_old` como NOT NULL. O insert falha porque o trigger tenta preencher `content_old` e não encontra valor. Corrigir via nova migration que torna `content_old` nullable ou remove a restrição residual.

## Capabilities

### New Capabilities
- `vote-toggle`: Permite desfazer ou trocar voto na pauta — inclui endpoint `removeVote` e ajuste de UI.

### Modified Capabilities
- `voting-system`: Atualiza requisitos de votação para suportar toggle/remoção de voto, corrige filtro de menção, e resolve constraint de DB no envio de comentários.

## Impact

- **Frontend:** `src/pages/TopicDetail.tsx` — lógica de `handleVote`, estado `userVoteOption`.
- **Edge Function:** `supabase/functions/api-governance/index.ts` — novo case `removeVote`, ajuste em `fetchTopicDetail` para retornar `userVoteOption`.
- **Edge Function:** `supabase/functions/api-members/index.ts` — `fetchUsers` case, adicionar filtro `ilike` pelo parâmetro `search`.
- **Migration:** nova migration `supabase/migrations/` para tornar `content_old` nullable na tabela `topic_comments`.
