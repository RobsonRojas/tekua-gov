## 1. Database Migration

- [x] 1.1 Criar nova migration SQL para atualizar as funções RPC no banco de dados.
- [x] 1.2 Atualizar a função RPC `execute_currency_transfer` para utilizar o sistema de ledger double-entry (`fn_record_ledger_entry`).
- [x] 1.3 Atualizar a função RPC `confirm_activity` para pagar a recompensa a partir da Tesouraria (remetente `NULL`) ao confirmar atividades com método de validação `requester_approval`.


## 2. Verification

- [x] 2.1 Executar a migration no banco local do Supabase.
- [x] 2.2 Validar que a confirmação de tarefas (work-wall) não falha por erro de restrição de saldo da trigger de ledger.
- [x] 2.3 Validar que a transação correspondente é registrada com remetente `NULL` (Tesouraria) e o saldo do executor é creditado corretamente.
