## Why

Atualmente, administradores (admins) e membros do Conselho Transversal não conseguem moderar (aprovar ou reprovar) atividades no Mural de Trabalhos caso a chamada interna execute a partir do `supabaseAdmin` (service role) do Edge Function. Isso ocorre porque o contexto `auth.uid()` fica nulo na chamada do RPC `moderate_activity`, resultando no erro HTTP 400 `"Only transversal council or admins can moderate activities"`.

## What Changes

- Modificar o Edge Function `api-work` para invocar a função RPC `moderate_activity` utilizando a instância autenticada do `supabaseClient` em vez de `supabaseAdmin`. Como a função é declarada com `SECURITY DEFINER`, ela continuará executando com privilégios super-user, mas preservará o contexto `auth.uid()` do usuário autenticado para passar na checagem de regras/papéis.

## Capabilities

### New Capabilities

### Modified Capabilities
- `transversal-council-workflow`: Permitir que moderadores autorizados aprovem e reprovem tarefas no mural de trabalhos sem restrição ou erro de contexto de usuário.

## Impact

- **Backend APIs**: Modificação do arquivo `supabase/functions/api-work/index.ts` sob a ação `moderateActivity`.
