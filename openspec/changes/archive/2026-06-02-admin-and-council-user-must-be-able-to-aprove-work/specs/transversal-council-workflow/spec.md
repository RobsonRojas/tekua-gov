## MODIFIED Requirements

### Requirement: Task Approval Action
The system SHALL allow `transversal_council` members to approve pending tasks so they become visible to standard users.

#### Scenario: Approving a task
- **WHEN** a council member or admin clicks "Approve" on a `pending_approval` task.
- **THEN** the task status SHALL change to `open` and it SHALL become visible on the public Work Wall for all standard users, mesmo que o moderador (admin ou membro do conselho) seja o próprio criador/requester da tarefa.
