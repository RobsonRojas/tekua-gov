## Why

Ao usar o painel administrativo para ajustar o saldo de um membro, a operação agora lança corretamente o erro propagado até o frontend com a mensagem: `null value in column "reference_id" of relation "ledger_entries" violates not-null constraint`.

Isso ocorre porque na RPC `admin_adjust_wallet_balance`, ao criar a entrada no ledger via `fn_record_ledger_entry`, é passado `NULL` como `p_reference_id`, mas a tabela `ledger_entries` não permite valores nulos nessa coluna. O `reference_id` deve ser o ID da `transaction` criada na etapa imediatamente anterior do mesmo fluxo.

## What Changes

- Modificar a `admin_adjust_wallet_balance` para usar a cláusula `RETURNING id` ao fazer `INSERT INTO public.transactions`, guardando o ID em uma nova variável `v_transaction_id`.
- Passar `v_transaction_id` como argumento na chamada de `fn_record_ledger_entry` em vez de passar `NULL`.

## Capabilities

### New Capabilities
*(nenhuma)*

### Modified Capabilities
- `wallet-admin-operations`: O ajuste de saldo voltará a funcionar sem disparar erros de constraint do PostgreSQL.

## Impact

- `supabase/migrations/20260925020100_fix_admin_adjust_wallet_balance.sql` (ou criar uma nova migration que substitua esta).
