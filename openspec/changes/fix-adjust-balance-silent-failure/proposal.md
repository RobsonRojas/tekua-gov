## Why

O botão "Ajustar Saldo" do painel admin retorna HTTP 200 mas o saldo do membro não muda. A operação falha silenciosamente: a função PostgreSQL `admin_adjust_wallet_balance` usa `auth.uid()` para verificar se o chamador é admin, mas é invocada via `supabaseAdmin` (service role key) — que não carrega o JWT do usuário, fazendo `auth.uid()` retornar NULL. O erro é capturado pelo bloco `WHEN OTHERS` e retornado como `{ success: false }` dentro de um HTTP 200, passando despercebido pelo frontend.

## What Changes

- **RPC `admin_adjust_wallet_balance`**: remover a verificação de admin via `auth.uid()` dentro da função (já é verificada na Edge Function antes de chamar a RPC). A função é `SECURITY DEFINER` e chamada apenas pelo service role — a dupla verificação é redundante e quebra o fluxo.
- **Edge Function `api-wallet` — case `adjustBalance`**: adicionar verificação de `data.success` igual ao case `mintCurrency` — se `data && !data.success`, lançar erro com a mensagem do campo `data.error`.
- **Sem mudanças no frontend**: o `apiClient.invoke` já trata `result.error`, mas o erro nunca chegava até ele.

## Capabilities

### New Capabilities
*(nenhuma)*

### Modified Capabilities
- `wallet-admin-operations`: o comportamento de `adjustBalance` muda — operações inválidas agora retornam erro ao usuário em vez de falhar silenciosamente.

## Impact

- `supabase/functions/api-wallet/index.ts` — case `adjustBalance`
- Migration SQL nova para corrigir a função `admin_adjust_wallet_balance` (remover verificação `auth.uid()` interna — a autorização já é feita na Edge Function)
- Deploy da Edge Function `api-wallet`
