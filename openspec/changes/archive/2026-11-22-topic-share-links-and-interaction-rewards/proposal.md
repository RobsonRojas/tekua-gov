## Why

Pautas e comentários não têm como ser compartilhados por link, o que dificulta chamar membros para uma discussão específica. Além disso, participar do debate não é reconhecido: a comunidade quer premiar quem vota e comenta com surreais criados (mineração) a partir da carteira da tesouraria, com valor definido por pauta.

## What Changes

- Item de pauta na lista (`/voting`) ganha botão **copiar link da pauta** (`<origem>/voting/<id>`). Também disponível no detalhe da pauta.
- Cada comentário/resposta ganha botão **copiar link do comentário** (`<origem>/voting/<id>#comment-<commentId>`); ao abrir, a página rola até o comentário e o destaca.
- Cada pauta passa a ter um **valor de recompensa em surreais** (`reward_amount`, padrão 0 = sem recompensa), definido no formulário de criação e em um novo formulário de **edição de pauta** (somente admin).
- Interações com a pauta (**voto, comentário, resposta**) geram crédito em surreais ao autor, debitado da carteira da tesouraria no livro-razão (`ledger_entries`, `reference_type = 'topic_reward'`). Para conter inflação: **no máximo uma recompensa por membro, por pauta, por tipo de interação** (voto; comentário/resposta). Pauta encerrada não recompensa.
- Nova edge function action `updateTopic` (admin) e migração com a coluna e a tabela de controle de recompensas.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `voting-system`: links compartilháveis de pauta e comentário, valor de recompensa por pauta (criação/edição) e crédito de surreais por interação.

## Impact

- Banco: `discussion_topics.reward_amount`, tabela `topic_interaction_rewards` (unicidade por pauta/membro/tipo), RPC `grant_topic_reward` (SECURITY DEFINER, atômica, grava ledger).
- `supabase/functions/api-governance` (`createTopic`, novo `updateTopic`, `castVote`, `addComment`), `topicRules.ts`.
- `src/pages/Voting.tsx`, `src/pages/TopicDetail.tsx`, traduções, testes.
- Efeito financeiro: a tesouraria é debitada; migração e deploy em produção.
