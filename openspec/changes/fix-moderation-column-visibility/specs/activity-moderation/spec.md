## MODIFIED Requirements

### Requirement: Task Moderation Permissions
The system SHALL allow any user (regardless of role) to view the Moderation column and access editing capabilities. However, the system SHALL only allow users with the `admin` or `transversal_council` roles to formally moderate activities (approve or reject). These approval/rejection permissions MUST be validated on the backend using the user's `roles` array from their profile.

#### Scenario: Approved Moderation
- **WHEN** a user with the `transversal_council` role clicks "Approve" on a task with status `pending_approval`.
- **THEN** the system SHALL update the task status to `open` (if it's a new task) or `completed` (if it was a validation).
- **AND** the system SHALL correctly identify the user's role from the `roles` array.

#### Scenario: Denied Moderation Approval
- **WHEN** a user with only the `member` role attempts to approve or reject a task.
- **THEN** the system SHALL return a "Forbidden" error and prevent the action.

#### Scenario: Column Visibility for Members
- **WHEN** a user with only the `member` role views the tasks list.
- **THEN** the system SHALL display the Moderation column and allow them to edit the task details, but SHALL NOT allow them to approve or reject the task.
