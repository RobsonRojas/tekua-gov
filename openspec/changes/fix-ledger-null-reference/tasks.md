## 1. Banco de Dados

- [x] 1.1 Criar uma nova migration via CLI: `npx supabase migration new fix_admin_adjust_wallet_balance_ledger_ref`.
- [x] 1.2 Atualizar o arquivo de migration com o `CREATE OR REPLACE FUNCTION public.admin_adjust_wallet_balance(...)` com o fix do `v_transaction_id` no `RETURNING`.

## 2. Deploy e Teste

- [x] 2.1 Aplicar a migration localmente/no servidor para testar: `npx supabase db query -f <caminho da migration> --linked`.
- [ ] 2.2 Testar a operação de "Ajustar Saldo" no painel Admin na interface web e confirmar que o erro `null value in column "reference_id"` desaparece e o saldo do usuário é atualizado corretamente com sucesso.
