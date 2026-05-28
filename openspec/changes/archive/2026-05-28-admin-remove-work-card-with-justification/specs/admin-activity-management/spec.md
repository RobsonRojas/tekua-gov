## ADDED Requirements

### Requirement: Exclusão Justificada de Atividades
The system SHALL provide administrators with the capability to forcefully remove or archive any work activity directly from the user interface, provided they supply a justification.

#### Scenario: Admin deleting an activity
- **WHEN** an administrator initiates the deletion of an activity.
- **AND** provides a valid justification text.
- **THEN** the system SHALL remove the activity from public visibility.
- **AND** the system SHALL log the deletion action, the administrator's ID, and the justification text into the audit/history logs.

#### Scenario: Missing justification
- **WHEN** an administrator attempts to delete an activity but leaves the justification empty.
- **THEN** the system SHALL reject the request and prompt for a required justification.
