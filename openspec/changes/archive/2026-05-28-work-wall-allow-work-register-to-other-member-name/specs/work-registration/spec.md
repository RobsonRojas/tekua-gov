## ADDED Requirements

### Requirement: Registro de Trabalho em Nome de Outro Membro
The system SHALL allow an authenticated user to register a work activity on behalf of another member, specifying that other member as the actual executor (author) of the work.

#### Scenario: Registering work for another member
- **WHEN** a user fills out the work registration form and selects a different member in the "Membro Executor" field.
- **AND** submits the form.
- **THEN** the system SHALL create the activity and assign the selected member as the true author/executor.
- **AND** the rewards and validation flows SHALL target the selected executor, not the user who submitted the form.

#### Scenario: Registering work for self
- **WHEN** a user fills out the work registration form and does NOT select a different member (or selects themselves).
- **THEN** the system SHALL default the executor/author to the currently authenticated user.
