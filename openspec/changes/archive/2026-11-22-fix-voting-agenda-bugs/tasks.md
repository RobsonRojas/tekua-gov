## 1. Banco de Dados — Correção da constraint `content_old`

- [x] 1.1 Criar migration SQL `supabase/migrations/<timestamp>_fix_topic_comments_content_old_nullable.sql` com `ALTER TABLE topic_comments ALTER COLUMN content_old DROP NOT NULL;`
- [x] 1.2 Verificar no ambiente local/staging que `INSERT INTO topic_comments (topic_id, user_id, content, ...) VALUES (...)` sem `content_old` persiste sem erro
- [x] 1.3 Confirmar que nenhum trigger em `topic_comments` escreve obrigatoriamente em `content_old`

## 2. Edge Function `api-members` — Filtro de menção

- [x] 2.1 Em `supabase/functions/api-members/index.ts`, no case `fetchUsers`, extrair o parâmetro `search` de `params`
- [x] 2.2 Adicionar filtro condicional `.ilike('full_name', `%${search}%`)` à query quando `search` não for vazio
- [x] 2.3 Testar localmente: `fetchUsers({ search: 'Ana', limit: 5 })` deve retornar apenas membros com "Ana" no nome

## 3. Edge Function `api-governance` — Vote toggle

- [x] 3.1 Em `fetchTopicDetail`, alterar a detecção do voto do usuário para retornar `userVoteOption: string | null` (a opção votada) além de `userVoted: boolean`
- [x] 3.2 Adicionar case `removeVote` no switch do `api-governance`: recebe `topicId`, valida que o tópico está aberto, executa `DELETE FROM topic_votes WHERE topic_id = $1 AND user_id = $2`
- [x] 3.3 Garantir que `removeVote` retorna `{ removed: true }` em caso de sucesso

## 4. Frontend `TopicDetail.tsx` — Vote toggle

- [x] 4.1 Adicionar estado `userVoteOption: 'yes' | 'no' | 'abstain' | null` no componente, populado a partir da resposta de `fetchTopicDetail`
- [x] 4.2 Remover `disabled={hasVoted || ...}` dos botões de voto; manter apenas `disabled={topic.status === 'closed'}`
- [x] 4.3 Aplicar destaque visual ao botão da opção selecionada (`variant="contained"` para o botão votado, `variant="outlined"` para os demais)
- [x] 4.4 Atualizar `handleVote`: se `userVoteOption === option` → invocar `removeVote` e setar `userVoteOption = null`; caso contrário → invocar `castVote` e setar `userVoteOption = option`

## 5. Validação e Build

- [x] 5.1 Executar `npm run build` e confirmar que não há erros de TypeScript ou build
- [x] 5.2 Testar fluxo completo: votar → verificar destaque → clicar para desfazer → verificar que voto some → votar novamente em outra opção
- [x] 5.3 Testar menção: digitar `@` seguido de texto → confirmar que a lista é filtrada
- [x] 5.4 Testar envio de comentário → confirmar que persiste sem erro 400
