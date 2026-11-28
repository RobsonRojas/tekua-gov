## Context

A funcionalidade de voto (`castVote`) na Edge Function `api-governance` executa um `.upsert(...)` na tabela `topic_votes`. A tabela possui uma restrição de unicidade `UNIQUE(topic_id, user_id)`.
No PostgREST e Supabase, um `upsert` com cliente autenticado (`supabaseClient`) sob RLS executa `INSERT ... ON CONFLICT DO UPDATE`. Se não existir uma política RLS de `UPDATE` para `auth.uid() = user_id`, ou se o conflito não for gerenciado explicitamente através do cliente com permissão adequada (`supabaseAdmin` ou política de UPDATE explícita), o PostgreSQL acusa violação de chave duplicada (`topic_votes_topic_id_user_id_key`).

Além disso, a compilação do TypeScript acusa erro em `supabase/functions/_shared/password-email.ts` com a flag `erasableSyntaxOnly` ativa (`constructor(public missing: string, detail?: string)`), impedindo o sucesso do `npm run build`.

## Goals / Non-Goals

**Goals:**
- Garantir que `castVote` execute com sucesso tanto para o primeiro voto quanto para troca de voto, sem erro de `duplicate key`.
- Configurar explicitamente `onConflict: 'topic_id,user_id'` na chamada de upsert em `supabase/functions/api-governance/index.ts`.
- Usar `supabaseAdmin` para a escrita na tabela `topic_votes` no backend da Edge Function após autenticar e validar o usuário e tópico, garantindo consistência transacional e evitando problemas de RLS no upsert.
- Adicionar migration com a política RLS `Users can update their own vote` em `topic_votes` para consistência e segurança de RLS no banco de dados.
- Corrigir a sintaxe de classe em `supabase/functions/_shared/password-email.ts` e garantir que `npm run build` passe com sucesso.

**Non-Goals:**
- Não alterar a interface de usuário nem as opções de voto existentes (Sim, Não, Abstenção).
- Não alterar regras de recompensas (surreais) existentes.

## Decisions

1. **Uso de `supabaseAdmin` para persistência em `castVote`**:
   - *Decisão*: Como a Edge Function já valida o token de autenticação via `supabaseClient.auth.getUser()`, valida o status do tópico e assegura que `user_id` seja obrigatoriamente `user.id`, persistir via `supabaseAdmin` com `onConflict: 'topic_id,user_id'` garante que o `upsert` nunca falhe por conflitos de permissões no `DO UPDATE` do RLS.
   - *Alternativa*: Manter apenas `supabaseClient`. *Problema*: Exige sincronização estrita de permissões RLS no banco de produção remoto, que pode falhar caso haja discrepâncias em constraints ou triggers. Usar `supabaseAdmin` na Edge Function após validações explícitas elimina riscos e garante robustez.

2. **Migration com RLS de UPDATE na tabela `topic_votes`**:
   - *Decisão*: Criar migration SQL adicionando `CREATE POLICY IF NOT EXISTS "Users can update their own vote" ON topic_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`.
   - *Motivo*: Manter o modelo de segurança por RLS completo no banco caso haja acessos diretos via PostgREST.

3. **Correção de `erasableSyntaxOnly` em `password-email.ts`**:
   - *Decisão*: Declarar a propriedade `public missing: string;` explicitamente no corpo da classe e inicializá-la no construtor `this.missing = missing;`.

## Risks / Trade-offs

- [Risco: Concorrência de múltiplos cliques no voto] → Mitigação: O frontend já lida com estado e o backend com `onConflict: 'topic_id,user_id'` garante idempotência total.
