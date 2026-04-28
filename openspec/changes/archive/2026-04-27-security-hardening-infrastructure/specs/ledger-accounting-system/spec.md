## ADDED Requirements

### Requirement: Segurança de Acesso ao Ledger
O sistema SHALL restringir o acesso direto à tabela de `ledger_entries` através de Row Level Security (RLS) para prevenir que usuários visualizem ou manipulem registros financeiros de terceiros.

#### Scenario: Bloqueio de leitura de ledger por terceiros
- **WHEN** Um usuário autenticado tenta consultar as entradas de ledger de outro membro via API.
- **THEN** O banco de dados SHALL retornar zero resultados ou negar o acesso, a menos que o usuário seja o proprietário da wallet vinculada ou um administrador.
