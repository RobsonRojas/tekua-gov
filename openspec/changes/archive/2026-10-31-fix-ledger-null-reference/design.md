# Design: Fix Ledger Null Reference

## Architecture/Component Changes

O problema reside no fato de que `fn_record_ledger_entry` agora requer um `reference_id` não-nulo (desde a implementação do `ledger_entries`). Na função `admin_adjust_wallet_balance`, o ajuste ocorre em duas partes: um insert legacy em `transactions` e uma chamada a `fn_record_ledger_entry`. Porém, a chamada estava passando `NULL` como o último argumento.

A mudança arquitetural é simplesmente capturar o `id` da `transaction` legada e repassá-lo para a chamada do ledger.

## Technical Details

**`admin_adjust_wallet_balance` em `supabase/migrations/`:**

1.  Declarar uma variável `v_transaction_id UUID;`.
2.  Adicionar `RETURNING id INTO v_transaction_id` ao `INSERT INTO public.transactions`.
3.  Modificar `PERFORM public.fn_record_ledger_entry(...)` para passar `v_transaction_id` no lugar de `NULL`.

A nova migration pode se chamar `20260925030100_fix_admin_adjust_wallet_balance_ledger_ref.sql` e simplesmente substituir `CREATE OR REPLACE FUNCTION public.admin_adjust_wallet_balance(...)` com essa modificação.

## Open Questions

- Nenhuma. O problema é direto e causado por uma mudança de esquema anterior em `ledger_entries` que tornou `reference_id` obrigatório.
