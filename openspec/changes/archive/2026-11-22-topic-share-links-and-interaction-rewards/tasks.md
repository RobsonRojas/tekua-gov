## 1. Banco de dados

- [x] 1.1 Migração: `discussion_topics.reward_amount` (padrão 0, CHECK >= 0) e tabela `topic_interaction_rewards` com `UNIQUE(topic_id, user_id, kind)` e RLS
- [x] 1.2 Migração: RPC `grant_topic_reward` (SECURITY DEFINER, idempotente, ledger + `transactions`, retorna valor creditado); revogar EXECUTE de `anon`/`authenticated`
- [x] 1.3 Atualizar `full_database_schema.sql`
- [ ] 1.4 Aplicar migração em produção (SQL Editor do painel, a pedido do usuário) e rodar `verify_ledger_integrity()`

## 2. Regras e edge function

- [x] 2.1 `topicRules.ts`: `parseRewardAmount` (>= 0, 2 casas, `MAX_TOPIC_REWARD`) + testes Deno
- [x] 2.2 `createTopic`: aceitar e validar `rewardAmount`
- [x] 2.3 Nova action `updateTopic` (admin): título, conteúdo, `rewardAmount`
- [x] 2.4 `castVote`: chamar `grant_topic_reward(kind='vote')` após salvar; devolver `reward`
- [x] 2.5 `addComment`: chamar `grant_topic_reward(kind='comment')` após salvar (inclui respostas); devolver `reward`
- [x] 2.6 `fetchTopics`/`fetchTopicDetail` devolvem `reward_amount` (confirmar com `select('*')`)
- [ ] 2.7 Deploy de `api-governance` (a pedido do usuário)

## 3. Frontend

- [x] 3.1 Utilitário de links (`buildTopicUrl`, `buildCommentUrl`) + cópia para a área de transferência com aviso, com testes
- [x] 3.2 `Voting.tsx`: botão copiar link em cada item da lista
- [x] 3.3 `TopicDetail.tsx`: botão copiar link da pauta, botão copiar link em cada comentário/resposta, `id="comment-<id>"`, rolagem e destaque via `location.hash`
- [x] 3.4 Extrair `TopicFormDialog` com campo de recompensa; usar em criação (`Voting`) e edição (admin, em `Voting`/`TopicDetail`)
- [x] 3.5 Exibir aviso "+X surreais" quando a resposta trouxer `reward`; mostrar o valor de recompensa na pauta
- [x] 3.6 Garantir que o login devolve ao deep link da pauta/comentário
- [x] 3.7 Traduções pt/en

## 4. Testes e verificação

- [x] 4.1 Testes Vitest: copiar links, destaque por hash, campo de recompensa na criação/edição, aviso de crédito
- [x] 4.2 Rodar `npx deno test` e `npx vitest run` dos arquivos tocados
- [ ] 4.3 Em produção: criar pauta com recompensa, votar e comentar com outro membro, conferir crédito único, saldo da tesouraria e histórico da carteira
