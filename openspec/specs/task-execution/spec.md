# task-execution Specification

## Purpose
Permitir que membros da comunidade assumam a responsabilidade por demandas abertas, acompanhem seu progresso e as submetam para validação.
## Requirements
### Requirement: Task Claiming
O sistema SHALL permitir que um membro autenticado assuma uma demanda com status 'open', ou que a demanda seja transicionada automaticamente para 'in_progress' se já possuir um executor atribuído no momento da ativação.

#### Scenario: Successful task claim
- **WHEN** um membro clica em "Assumir Tarefa" em uma demanda aberta sem executor definido
- **THEN** o sistema SHALL atualizar a tarefa definindo o membro como `worker_id` e o status como `in_progress`.
- **AND** a tarefa SHALL deixar de ser exibida na coluna "Abertas" para outros membros.

#### Scenario: Auto-transition to in_progress on activation
- **WHEN** uma atividade é ativada (aprovada por moderação) e já possui um `worker_id` definido
- **THEN** o sistema SHALL transicionar o status da atividade diretamente para `in_progress`.

### Requirement: Task Progress Management
O sistema SHALL permitir que o executor (worker) transicione a tarefa para o status de validação após a conclusão, fornecendo uma ou mais evidências de trabalho.

#### Scenario: Submitting task for validation with multiple evidences
- **WHEN** o executor fornece um conjunto de arquivos ou links como evidência de conclusão.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' e armazenar todas as referências de evidência.

### Requirement: Task State Change Events
O sistema SHALL emitir eventos de sistema rastreáveis sempre que o estado de uma tarefa for alterado.

#### Scenario: Emit event on claim
- **WHEN** um membro clica em "Assumir Tarefa".
- **THEN** o sistema SHALL garantir que a mudança de status dispare o gatilho de notificação para o solicitante.

#### Scenario: Emit event on validation request
- **WHEN** o executor submete a tarefa para validação.
- **THEN** o sistema SHALL garantir que o gatilho de notificação seja disparado para as partes interessadas.

