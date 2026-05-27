# admin-governance-config Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Configuração de Governança Digital
Administradores da Tekuá **MUST** ser capazes de ajustar os parâmetros de validação comunitária via painel administrativo, e o sistema **MUST** persistir essas alterações adequadamente na tabela `governance_settings`.

#### Scenario: Ajuste de threshold mínimo
- **WHEN** O administrador altera o valor de `min_confirmations` de 3 para 5.
- **THEN** O valor 5 é salvo na tabela de configurações e todas as contribuições submetidas após o ajuste devem alcançar 5 votos para o pagamento automático.

#### Scenario: Validação de valor mínimo de threshold
- **WHEN** O administrador tenta configurar `min_confirmations` como 0.
- **THEN** O sistema impede a ação, exigindo pelo menos 1 confirmação para evitar spam.

#### Scenario: Notificação de mudança de regra
- **WHEN** O administrador altera o threshold de governança.
- **THEN** Uma notificação global é gerada para que todos os membros saibam da alteração no nível de rigor.

#### Scenario: Histórico de configuração
- **WHEN** O threshold é alterado.
- **THEN** O sistema registra quem fez a alteração e em qual data/hora para auditoria.

### Requirement: Persistence of Governance Parameters
The system SHALL persist all governance parameters in a centralized `governance_settings` table to ensure consistent behavior across the platform.

#### Scenario: Singleton Settings Record
- **WHEN** the system is initialized.
- **THEN** it MUST ensure a single record with ID 'current' exists in the `governance_settings` table.

#### Scenario: Read Settings on App Startup
- **WHEN** the platform services (e.g., Voting, Work Registration) load.
- **THEN** they MUST fetch the 'current' governance settings to apply validation rules correctly.

