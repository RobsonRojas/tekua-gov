## ADDED Requirements

### Requirement: Task Moderation Permissions
The system SHALL only allow users with the `admin` or `transversal_council` roles to moderate activities (approve or reject). These permissions MUST be validated on the backend using the user's `roles` array from their profile.

#### Scenario: Approved Moderation
- **WHEN** a user with the `transversal_council` role clicks "Approve" on a task with status `pending_approval`.
- **THEN** the system SHALL update the task status to `open` (if it's a new task) or `completed` (if it was a validation).
- **AND** the system SHALL correctly identify the user's role from the `roles` array.

#### Scenario: Denied Moderation
- **WHEN** a user with only the `member` role attempts to moderate a task.
- **THEN** the system SHALL return a "Forbidden" error and prevent the action.

### Requirement: Localized Moderation Labels
The system SHALL provide localized labels for task moderation actions in both Portuguese and English.

#### Scenario: Portuguese Labels
- **WHEN** the user's language is set to Portuguese (`pt`).
- **THEN** the "Approve" button SHALL display "Aprovar" and the "Reject" button SHALL display "Rejeitar" (or "Reprovar").

#### Scenario: English Labels
- **WHEN** the user's language is set to English (`en`).
- **THEN** the "Approve" button SHALL display "Approve" and the "Reject" button SHALL display "Reject".
