## MODIFIED Requirements

### Requirement: Quadro de Tarefas Comunitárias
O sistema SHALL permitir que membros acessem um quadro central para cadastrar e visualizar tarefas solicitadas pela comunidade.

#### Scenario: Cadastro de Nova Tarefa
- **WHEN** um membro autenticado descreve uma tarefa, define o valor em "Surreais" e anexa a localização geográfica aproximada.
- **THEN** a tarefa é registrada com status `pending_approval` e aguarda moderação do Conselho Transversal.

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' com status inicial 'pending_approval'.

#### Scenario: Successful task creation
- **WHEN** um membro autenticado fornece título, descrição e um valor de recompensa positivo
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id` e definir o status como `pending_approval`.

## ADDED Requirements

### Requirement: Task Visibility Restrictions
The system SHALL restrict visibility of tasks based on their status.

#### Scenario: Public visibility of open tasks
- **WHEN** any user views the Work Wall.
- **THEN** only tasks with `open` status SHALL be visible.

#### Scenario: Restricted visibility of pending tasks
- **WHEN** a regular user views the Work Wall.
- **THEN** tasks with `pending_approval` status SHALL NOT be visible, unless they are the creator of the task.

#### Scenario: Council visibility of pending tasks
- **WHEN** a member of the `transversal_council` views the Work Wall or moderation dashboard.
- **THEN** tasks with `pending_approval` status SHALL be visible.
