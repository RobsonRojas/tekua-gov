## ADDED Requirements

### Requirement: Transversal Council Role
The system SHALL support a specific user role named `transversal_council`.

#### Scenario: Role assignment
- **WHEN** an admin assigns the `transversal_council` role to a user.
- **THEN** the user SHALL have access to moderation features for Work Wall tasks.

### Requirement: Moderation Dashboard
The system SHALL provide a moderation interface accessible only to `transversal_council` members.

#### Scenario: Accessing moderation dashboard
- **WHEN** a `transversal_council` member navigates to the moderation section.
- **THEN** the system SHALL display a list of all tasks and demands with `pending_approval` status.

### Requirement: Task Approval Action
The system SHALL allow `transversal_council` members to approve pending tasks.

#### Scenario: Approving a task
- **WHEN** a council member clicks "Approve" on a `pending_approval` task.
- **THEN** the task status SHALL change to `open` and it SHALL become visible on the public Work Wall.

### Requirement: Task Rejection Action
The system SHALL allow `transversal_council` members to reject pending tasks.

#### Scenario: Rejecting a task
- **WHEN** a council member clicks "Reject" on a `pending_approval` task.
- **THEN** the task status SHALL change to `rejected` and it SHALL remain hidden from the public Work Wall.

### Requirement: Automated Validation
The system SHALL have automated tests to validate the transversal council approval workflow.

#### Scenario: Unit testing approval logic
- **WHEN** unit tests are executed for the task status transition logic.
- **THEN** they SHALL verify that only authorized roles can transition tasks to `open`.

#### Scenario: Integration testing the approval flow
- **WHEN** an integration test simulates a council member approving a pending task in the browser.
- **THEN** it SHALL verify that the task becomes visible to other users on the Work Wall.
