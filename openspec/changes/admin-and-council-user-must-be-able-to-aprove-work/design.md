## Context

Na tabela `activities`, a moderação das tarefas criadas no mural depende da chamada da RPC `moderate_activity(p_activity_id, p_action)`.
Dentro desta RPC, existe uma checagem de privilégio:
```sql
IF NOT public.is_transversal_council_or_admin() THEN
  RAISE EXCEPTION 'Only transversal council or admins can moderate activities';
END IF;
```
A função auxiliar `is_transversal_council_or_admin` baseia-se em `auth.uid()`.
Como o Edge Function `api-work` realiza a chamada utilizando a instância `supabaseAdmin` (chave de acesso service role), o token JWT de autenticação do usuário não é encaminhado ao banco de dados, resultando em um valor `null` para `auth.uid()`. Devido a isso, mesmo que um administrador legítimo solicite a aprovação, a checagem falha com erro 400.

## Goals / Non-Goals

**Goals:**
- Alterar a invocação da RPC `moderate_activity` em `supabase/functions/api-work/index.ts` sob a ação `moderateActivity` para utilizar o `supabaseClient`. Isso encaminha o token JWT e assegura que `auth.uid()` seja corretamente populado.

**Non-Goals:**
- Não alteraremos as assinaturas das RPCs SQL ou permissões das tabelas no banco de dados.

## Decisions

- **Invocação via `supabaseClient`**:
  - Utilizar a chamada `supabaseClient.rpc('moderate_activity', ...)` na linha 457 do arquivo `supabase/functions/api-work/index.ts`.
  - Como a função PostgreSQL `moderate_activity` foi criada com a cláusula `SECURITY DEFINER`, ela executa com privilégios de super-usuário, permitindo que ela atualize a tabela `activities` mesmo quando chamada pelo cliente anônimo autenticado do usuário.

## Risks / Trade-offs

- **[Risco] Segurança / Execução Não Autorizada**: A função sendo `SECURITY DEFINER` permite que o cliente de usuário faça a chamada.
  - **Mitigação**: O próprio código PL/pgSQL executa a verificação estrita `public.is_transversal_council_or_admin()`, que agora validará com sucesso usando o `auth.uid()` do usuário autenticado no cabeçalho do `supabaseClient`. Portanto, apenas admins e membros do conselho conseguem invocá-la com sucesso.
