# wallet-admin-operations (Delta Spec)

## Overview

Ajuste no registro de transações ao modificar o saldo do membro pelo painel administrativo para não violar as restrições do banco de dados e garantir a rastreabilidade na tabela `ledger_entries`.

## Component: Admin Adjust Wallet Balance RPC

### Context

O RPC `admin_adjust_wallet_balance` foi previamente corrigido para o problema de autenticação. Agora, ele precisa lidar corretamente com o log duplo de transações: a tabela legacy `transactions` e a tabela double-entry `ledger_entries`.

### Delta: Ledger Entry Reference ID

- **Comportamento Atual:** A inserção em `ledger_entries` através de `fn_record_ledger_entry` recebe `NULL` para o campo `reference_id`, violando uma restrição `NOT NULL` e falhando a transação inteira.
- **Novo Comportamento:** A inserção em `transactions` (legacy) deve retornar o `id` gerado via cláusula `RETURNING id`. Esse `id` deve ser armazenado na variável local `v_transaction_id` e repassado como o 5º argumento para `fn_record_ledger_entry`, provendo o `reference_id` exigido pelo esquema.
- **Resultado Esperado:** O RPC processará o ajuste de saldo, inserindo a transação legacy e a transação correspondente no `ledger_entries` perfeitamente vinculadas. O frontend receberá uma resposta de sucesso (`{ "success": true }`).
