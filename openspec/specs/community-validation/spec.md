# community-validation Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Validação Social de Contribuições
Membros da Vila **SHALL** confirmar a realização de trabalhos publicados no mural quando o método de validação for `community_consensus`. Se for `requester_approval`, apenas o beneficiário indicado tem permissão para confirmar o trabalho.

#### Scenario: Validação por beneficiário único (requester_approval)
- **WHEN** uma tarefa com `validation_method = requester_approval` é visualizada.
- **AND** o usuário logado é o `requester_id` da tarefa.
- **AND** ele confirma a atividade.
- **THEN** o sistema marca a atividade como concluída imediatamente e realiza a transferência da recompensa, sem aguardar outros votos.

#### Scenario: Validação por terceiros não autorizados
- **WHEN** um usuário tenta confirmar uma tarefa configurada com `requester_approval`.
- **AND** ele não é o `requester_id` da tarefa.
- **THEN** o sistema **SHALL** impedir a ação e retornar um erro "Only the requester can approve this activity".

### Requirement: Centralized Validation RPC
The backend API **MUST** process all activity confirmations using the centralized `confirm_activity` database RPC to ensure consistency, security, and automated payout execution.

#### Scenario: Backend routing
- **WHEN** the `api-work` function receives a `confirmActivity` request.
- **THEN** it SHALL call the `confirm_activity` RPC instead of performing direct inserts on `activity_confirmations`.

