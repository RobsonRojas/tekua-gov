## Context

- Rota da pauta: `/voting/:id`; `TopicDetail` carrega comentários via `api-governance:fetchTopicDetail`. Pautas só são visíveis a autenticados (RLS), então "link compartilhável" é um deep link que exige login, não um link público com token (diferente de `/share/surreal/...` e `/share/circle/...`).
- Tesouraria é a carteira com `profile_id IS NULL`; o CHECK `balance >= 0` só vale para carteiras de membros, logo a tesouraria pode ser debitada sem limite (mineração). O padrão existente para movimentar via livro-razão é `fn_record_ledger_entry(from, to, amount, type, ref_id)`; o saldo é sincronizado por trigger. `wallets` tem `tr_prevent_direct_balance_update`, então só o livro-razão altera saldo.
- Não existe edição de pauta hoje.

## Decisions

- **Links:** `${origin}/voting/${id}` e `${origin}/voting/${id}#comment-${commentId}`. Cada comentário recebe `id="comment-<id>"`; `TopicDetail` lê `location.hash` após carregar, faz `scrollIntoView` e aplica destaque temporário. Cópia via `navigator.clipboard.writeText` com fallback e aviso (Snackbar) de sucesso/falha. Login: o `ProtectedRoute` já deve preservar o destino (verificar; se não, guardar `redirect` no estado/URL).
- **Interpretação de "qualquer interação":** voto, comentário e resposta. Pagar a cada interação permitiria farmar surreais com spam; por isso um pagamento por (pauta, membro, tipo) com dois tipos: `vote` e `comment` (resposta conta como comentário). Valor único por pauta (`reward_amount`) para os dois tipos. **Ponto a confirmar com o dono do produto**: se prefere pagar cada comentário (com limite diário) ou valores distintos por tipo.
- **Esquema:** `discussion_topics.reward_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (reward_amount >= 0)`. Tabela `topic_interaction_rewards(id, topic_id, user_id, kind CHECK in ('vote','comment'), amount, created_at, UNIQUE(topic_id, user_id, kind))`, RLS ligada sem policy de escrita (só service role/RPC), leitura do próprio membro.
- **Pagamento atômico e idempotente:** RPC `grant_topic_reward(p_topic_id, p_user_id, p_kind)` SECURITY DEFINER: lê `reward_amount` e `status` da pauta; se 0 ou `closed`, retorna 0; `INSERT ... ON CONFLICT DO NOTHING` em `topic_interaction_rewards` (se não inseriu, retorna 0); então `fn_record_ledger_entry(tesouraria, carteira do membro, amount, 'topic_reward', reward_id)` e uma linha em `transactions` (`from_id NULL`) para aparecer no histórico da carteira. Tudo na mesma transação da função; REVOKE de EXECUTE para `anon`/`authenticated`, chamada só pela edge function com service role.
- **Fluxo na edge function:** `castVote`/`addComment` salvam a interação primeiro e então chamam `grant_topic_reward`; falha no pagamento é logada e não desfaz o voto/comentário (a unicidade impede duplicar numa nova tentativa, mas o membro perde a recompensa daquela vez; aceitável e visível em log). A resposta inclui `reward: { amount }` quando houve crédito; o frontend mostra aviso.
- **Limite do valor:** constante `MAX_TOPIC_REWARD` em `topicRules.ts` (valor inicial 100) validada em `createTopic`/`updateTopic` para evitar erro de digitação drenando a tesouraria; `parseRewardAmount` é uma regra pura testável, arredondando a 2 casas.
- **`updateTopic`:** admin-only (mesma checagem de `createTopic`), campos `title`, `content`, `rewardAmount`; atualiza `updated_at`. UI: botão "Editar" (admin) em `TopicDetail`/lista reutilizando o diálogo de criação, extraído para componente `TopicFormDialog`.
- **Voto muda de opção (upsert):** `castVote` usa upsert; a unicidade por `kind='vote'` impede pagar de novo ao trocar o voto.

## Risks / Trade-offs

- **Inflação/abuso:** mitigado por uma recompensa por tipo/pauta/membro e teto de valor; contas falsas continuam possíveis, mas o cadastro já é controlado por admin.
- **Efeito financeiro em produção:** a tesouraria passa a ser debitada em ações de membros; a migração e o deploy devem ser feitos nessa ordem, e o valor padrão 0 mantém o comportamento atual até um admin configurar.
- **Ledger:** `verify_ledger_integrity` deve continuar passando; incluir teste/consulta após aplicar.
- **Deep link sem sessão:** depende de o fluxo de login devolver ao destino; se não existir, entra como tarefa.
