## ADDED Requirements

### Requirement: Wallet Deposit Notice in Demand Forms
The system SHALL display a notice in the demand creation and demand edit forms informing users that the defined value will be deposited into each executor's wallet: "O valor definido será depositado na carteira de cada um dos executores".

#### Scenario: Notice on demand creation form
- **WHEN** a user opens the demand creation form
- **THEN** the system SHALL display the wallet deposit notice near the value field

#### Scenario: Notice on demand edit form
- **WHEN** a user opens an existing demand for editing
- **THEN** the system SHALL display the same wallet deposit notice near the value field
