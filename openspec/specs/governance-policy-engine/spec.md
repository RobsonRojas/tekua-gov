# governance-policy-engine Specification

## Purpose
TBD - created by archiving change governance-flex-policy. Update Purpose after archive.
## Requirements
### Requirement: Período de Carência Configurável
O sistema **SHALL** permitir que o período de carência de um payout seja definido com base em políticas pré-configuradas.

#### Scenario: Aplicação de política por valor
- **WHEN** Uma atividade de 500 Surreals é validada.
- **AND** Existe uma política para atividades acima de 400 Surreals com carência de 48 horas.
- **THEN** A data de liberação (`available_at`) é definida para 48 horas após a validação.

### Requirement: Auditoria Manual Obrigatória
O sistema **SHALL** bloquear payouts que atingem critérios de risco definidos até que uma aprovação manual seja registrada.

#### Scenario: Payout aguardando auditoria
- **WHEN** Uma atividade é validada e marcada como `requires_audit = true`.
- **THEN** O saldo permanece indisponível mesmo após o tempo de carência (`available_at`) ter passado.
- **AND** O saldo só se torna disponível após um administrador marcar o status como `approved`.

