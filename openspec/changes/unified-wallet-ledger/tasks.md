## 1. Schema do Ledger

- [ ] 1.1 Criar tabela `ledger_entries` com suporte a débitos/créditos e referências cruzadas.
- [ ] 1.2 Implementar índices por `wallet_id` e `reference_id` para consultas rápidas.
- [ ] 1.3 Criar contas de sistema iniciais (Treasury, Fees, etc.) na tabela `wallets`.

## 2. Motor de Contabilidade (Database Logic)

- [ ] 2.1 Desenvolver a função `fn_record_ledger_entry()` que garante a partida dobrada.
- [ ] 2.2 Criar trigger em `ledger_entries` para atualizar automaticamente `wallets.balance`.
- [ ] 2.3 Refatorar RPC de `perform_transfer` para inserir entradas no ledger em vez de atualizar `wallets` diretamente.

## 3. Migração e Reconciliação

- [ ] 3.1 Desenvolver script de migração para converter dados históricos em entradas de ledger.
- [ ] 3.2 Implementar a função `verify_ledger_integrity()` para detectar discrepâncias.
- [ ] 3.3 Atualizar o dashboard administrativo com métricas de reconciliação financeira.

## 4. Validação

- [ ] 4.1 Testar um ciclo completo de payout: validação de atividade -> geração de ledger -> atualização de saldo.
- [ ] 4.2 Validar que o saldo não pode ser alterado manualmente via SQL sem passar pelo ledger (proteção via trigger).
- [ ] 4.3 Verificar a integridade do ledger após uma série de transferências e estornos simulados.
