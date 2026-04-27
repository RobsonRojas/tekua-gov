# task-execution Specification

## Purpose
Permitir que membros da comunidade assumam a responsabilidade por demandas abertas, acompanhem seu progresso e as submetam para validação.

## Requirements

### Requirement: Task Claiming
O sistema SHALL permitir que um membro autenticado assuma uma demanda com status 'open'.

#### Scenario: Successful task claim
- **WHEN** um membro clica em "Assumir Tarefa" em uma demanda aberta
- **THEN** o sistema SHALL atualizar a tarefa definindo o membro como `worker_id` e o status como `in_progress`.
- **AND** a tarefa SHALL deixar de ser exibida na coluna "Abertas" para outros membros.

### Requirement: Task Progress Management
O sistema SHALL permitir que o executor (worker) transicione a tarefa para o status de validação após a conclusão.

#### Scenario: Submitting task for validation
- **WHEN** o executor fornece a evidência de conclusão
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation'.
