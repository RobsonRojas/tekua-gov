## ADDED Requirements

### Requirement: Registro em Partida Dobrada
O sistema **SHALL** registrar todas as movimentações financeiras como entradas de ledger que se equilibram.

#### Scenario: Payout de atividade no ledger
- **WHEN** Uma atividade de 100 Surreals é liberada para um usuário.
- **THEN** Uma entrada de débito (-100) é criada para a conta `REWARDS_POOL`.
- **AND** Uma entrada de crédito (+100) é criada para a `wallet` do usuário.
- **AND** A soma de ambas as entradas na transação é zero.

### Requirement: Imutabilidade do Ledger
O sistema **MUST** garantir que as entradas do ledger sejam imutáveis após a criação. Correções devem ser feitas através de novas entradas de estorno.

#### Scenario: Estorno de transação errônea
- **WHEN** Uma transferência incorreta é identificada.
- **THEN** O administrador não edita o registro original.
- **AND** O sistema cria uma nova transação de ledger com valores invertidos para anular o efeito da anterior.
