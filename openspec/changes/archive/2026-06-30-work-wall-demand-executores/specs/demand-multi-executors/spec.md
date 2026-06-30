## ADDED Requirements

### Requirement: Multi-Executor Demand Assignment
The system SHALL allow multiple users to be assigned as executors for a single Work-Wall demand.

#### Scenario: Assigning multiple executors during creation
- **WHEN** an authenticated user creates a new demand on the Work-Wall
- **THEN** they SHALL be able to select one or multiple users using a multi-select component.
- **THEN** the system SHALL store the selected users in an array (e.g., `executor_ids`) linked to the task.

### Requirement: Multi-Executor Notification
The system SHALL notify all assigned executors when a demand is created or its status changes.

#### Scenario: Notification on demand creation
- **WHEN** a demand is successfully created with multiple executors
- **THEN** the system SHALL trigger an in-app notification and an email to each of the assigned executors, containing a direct link to the demand details.

#### Scenario: Notification on demand completion
- **WHEN** a demand is confirmed as completed by the requester or admin
- **THEN** the system SHALL trigger an in-app notification and an email to each of the assigned executors.
