## Why

Ao tentar votar ou alterar o voto em uma pauta através dos botões Sim, Não ou Abstenção, a requisição para a Edge Function `api-governance` na ação `castVote` falha com status HTTP 400 e a mensagem `"duplicate key value violates unique constraint \"topic_votes_topic_id_user_id_key\""`.
Isso ocorre porque:
1. No backend (`supabase/functions/api-governance/index.ts`), o método `.upsert(...)` é executado utilizando o cliente autenticado `supabaseClient` em vez do cliente administrador `supabaseAdmin` (ou sem as permissões adequadas de RLS para UPDATE na tabela `topic_votes`).
2. O PostgREST executa um `INSERT ... ON CONFLICT DO UPDATE`. Caso não haja uma política de `UPDATE` permitindo ao usuário atualizar o seu próprio voto na tabela `topic_votes` (ou se o cliente comum sofrer restrição RLS de UPDATE), o Postgres falha na violação da constraint única (`topic_votes_topic_id_user_id_key`).
3. Adicionalmente, a chamada `.upsert(...)` não especifica explicitamente o `onConflict: 'topic_id,user_id'`, e precisa ser executada de forma segura para permitir a troca ou registro de voto por membro autenticado.
4. Concomitantemente, corrigiremos o erro de compilação TypeScript em `supabase/functions/_shared/password-email.ts` para restabelecer a integridade de build (`npm run build`) exigida pelas diretrizes do projeto.

## What Changes

- **Backend (`supabase/functions/api-governance/index.ts`)**:
  - Ajustar o caso `castVote` para garantir que o voto do usuário seja inserido ou atualizado com sucesso. Especificar `onConflict: 'topic_id,user_id'` e utilizar `supabaseAdmin` (ou garantir RLS) para garantir a idempotência e a capacidade de alterar o voto de forma confiável.
- **Banco de Dados (Migration)**:
  - Adicionar política RLS de `UPDATE` na tabela `topic_votes` (`CREATE POLICY "Users can update their own vote" ON topic_votes FOR UPDATE USING (auth.uid() = user_id)`), garantindo alinhamento de segurança a nível de banco.
- **Tipagem / Build (`supabase/functions/_shared/password-email.ts`)**:
  - Ajustar a classe de erro para não utilizar parâmetro de propriedade no construtor com `erasableSyntaxOnly` ativado, restaurando a aprovação do `npm run build`.

## Capabilities

### Modified Capabilities
- `vote-toggle`: Permite registrar, trocar e atualizar votos em pautas sem falhar por violação de unicidade (`topic_votes_topic_id_user_id_key`).

## Impact

- `supabase/functions/api-governance/index.ts`: Fluxo do endpoint `castVote`.
- `supabase/migrations/`: Nova migration adicionando política de UPDATE em `topic_votes`.
- `supabase/functions/_shared/password-email.ts`: Correção de sintaxe para conformidade do TypeScript compiler.
- `src/pages/TopicDetail.tsx`: Fluxo de votação e troca de voto.
