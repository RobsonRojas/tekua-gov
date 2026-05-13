## MODIFIED Requirements

### Requirement: Task Progress Management
O sistema SHALL permitir que o executor (worker) transicione a tarefa para o status de validação após a conclusão, fornecendo uma ou mais evidências de trabalho.

#### Scenario: Submitting task for validation with multiple evidences
- **WHEN** o executor fornece um conjunto de arquivos ou links como evidência de conclusão.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' e armazenar todas as referências de evidência.
