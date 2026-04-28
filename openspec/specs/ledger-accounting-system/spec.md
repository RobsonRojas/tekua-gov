# ledger-accounting-system Specification

## Purpose
Garantir a integridade financeira da plataforma através de um sistema de contabilidade de partida dobrada (ledger), assegurando que todos os créditos e débitos estejam equilibrados e sejam auditáveis.

## Requirements

### Requirement: Registro em Partida Dobrada
O sistema SHALL registrar todas as movimentações financeiras como entradas de ledger que se equilibram.

#### Scenario: Payout de atividade no ledger
- **WHEN** Uma atividade de 100 Surreals é liberada para um usuário.
- **THEN** Uma entrada de débito (-100) é criada para a conta `REWARDS_POOL`.
- **AND** Uma entrada de crédito (+100) é criada para a `wallet` do usuário.
- **AND** A soma de ambas as entradas na transação é zero.

### Requirement: Imutabilidade do Ledger
O sistema MUST garantir que as entradas do ledger sejam imutáveis após a criação. Correções devem ser feitas através de novas entradas de estorno.

#### Scenario: Estorno de transação errônea
- **WHEN** Uma transferência incorreta é identificada.
- **THEN** O administrador não edita o registro original.
- **AND** O sistema cria uma nova transação de ledger com valores invertidos para anular o efeito da anterior.

### Requirement: Segurança de Acesso ao Ledger
O sistema SHALL restringir o acesso direto à tabela de `ledger_entries` através de Row Level Security (RLS) para prevenir que usuários visualizem ou manipulem registros financeiros de terceiros.

#### Scenario: Bloqueio de leitura de ledger por terceiros
- **WHEN** Um usuário autenticado tenta consultar as entradas de ledger de outro membro via API.
- **THEN** O banco de dados SHALL retornar zero resultados ou negar o acesso, a menos que o usuário seja o proprietário da wallet vinculada ou um administrador.

