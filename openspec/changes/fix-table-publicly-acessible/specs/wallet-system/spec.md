## ADDED Requirements

### Requirement: Proteção de Registros do Ledger
O sistema SHALL garantir que os registros individuais do ledger (contabilidade) sejam protegidos contra acesso não autorizado e modificações externas.

#### Scenario: RLS Enforcement on Ledger
- **WHEN** um usuário tenta acessar a tabela `ledger_entries` diretamente via API Client.
- **THEN** o sistema SHALL permitir a leitura apenas das entradas vinculadas à carteira do próprio usuário (via `wallet_id`) ou permitir leitura total caso o usuário possua a role `admin`.

#### Scenario: Immutable Ledger Records
- **WHEN** qualquer usuário tenta realizar uma operação de `UPDATE` ou `DELETE` na tabela `ledger_entries`.
- **THEN** o sistema SHALL bloquear a operação por padrão, garantindo que o histórico contábil seja imutável via interface direta.
