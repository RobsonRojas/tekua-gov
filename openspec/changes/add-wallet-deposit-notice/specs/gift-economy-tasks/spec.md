## ADDED Requirements

### Requirement: Wallet Deposit Notice in Task Forms
The system SHALL display a notice in the task creation and task edit forms informing users that the defined value will be deposited into each executor's wallet: "O valor definido será depositado na carteira de cada um dos executores".

#### Scenario: Notice on task creation form
- **WHEN** a user opens the task creation form
- **THEN** the system SHALL display the wallet deposit notice near the value field

#### Scenario: Notice on task edit form
- **WHEN** a user opens an existing task for editing
- **THEN** the system SHALL display the same wallet deposit notice near the value field
