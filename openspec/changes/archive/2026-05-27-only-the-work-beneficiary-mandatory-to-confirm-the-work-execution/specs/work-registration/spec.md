## ADDED Requirements

### Requirement: Registro de Beneficiário Específico
The system SHALL allow users to specify a particular beneficiary (`requester_id`) when registering completed work. If a beneficiary is specified, the system **MUST** automatically assign `requester_approval` as the validation method for the task.

#### Scenario: Submitting work with a beneficiary
- **WHEN** a user registers work and provides a valid `requester_id`.
- **THEN** the system SHALL set the task's validation method to `requester_approval`.
- **AND** it SHALL bypass the `community_consensus` default, meaning no community votes will be required or accepted.

#### Scenario: Submitting work without a beneficiary
- **WHEN** a user registers work without providing a `requester_id`.
- **THEN** the system SHALL default the task's validation method to `community_consensus`.
