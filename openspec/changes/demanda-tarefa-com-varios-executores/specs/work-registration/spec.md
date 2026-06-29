## MODIFIED Requirements

### Requirement: Registro de Trabalho em Nome de Outro Membro ou Múltiplos Membros
The system SHALL allow an authenticated user to register a work activity on behalf of one or more members, specifying those members as the actual executors (authors) of the work. Se não houver seleção, o sistema deve registrar a tarefa em nome do próprio usuário autenticado.

#### Scenario: Registering work for multiple members
- **WHEN** a user fills out the work registration form and selects dois ou mais membros no campo de executores.
- **AND** submits the form.
- **THEN** the system SHALL create the activity and assign todos os membros selecionados como os verdadeiros autores/executores (`executor_ids`).
- **AND** the rewards and validation flows SHALL target os selecionados.

#### Scenario: Registering work for self
- **WHEN** a user fills out the work registration form and does NOT select a different member (or selects themselves).
- **THEN** the system SHALL default the executor(s) to the currently authenticated user.
