## MODIFIED Requirements

### Requirement: Task Claiming
O sistema SHALL permitir que um membro autenticado assuma uma demanda com status 'open', ou que a demanda seja transicionada automaticamente para 'in_progress' se já possuir um executor atribuído no momento da ativação.

#### Scenario: Successful task claim
- **WHEN** um membro clica em "Assumir Tarefa" em uma demanda aberta sem executor definido
- **THEN** o sistema SHALL atualizar a tarefa definindo o membro como `worker_id` e o status como `in_progress`.
- **AND** a tarefa SHALL deixar de ser exibida na coluna "Abertas" para outros membros.

#### Scenario: Auto-transition to in_progress on activation
- **WHEN** uma atividade é ativada (aprovada por moderação) e já possui um `worker_id` definido
- **THEN** o sistema SHALL transicionar o status da atividade diretamente para `in_progress`.
