## MODIFIED Requirements

### Requirement: Task Progress Management
O sistema SHALL permitir que o executor (worker) transicione a tarefa para o status de validação após a conclusão, com ou sem evidências de trabalho — a evidência é opcional. As evidências de trabalho, quando fornecidas, DEVEM ser exibidas em um modal integrado, garantindo que o usuário não seja redirecionado para outra aba durante a visualização.

#### Scenario: Submitting task for validation with multiple evidences
- **WHEN** o executor fornece um conjunto de arquivos ou links como evidência de conclusão.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' e armazenar todas as referências de evidência.

#### Scenario: Submitting task for validation without evidence
- **WHEN** o executor conclui a tarefa sem anexar nenhuma evidência de trabalho.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' mesmo assim, sem exigir qualquer evidência.

#### Scenario: Viewing task evidence
- **WHEN** um usuário clica em uma evidência de trabalho na página de detalhes da tarefa ou no card de atividade.
- **THEN** o sistema SHALL exibir a evidência em um modal centralizado na mesma aba, sem abrir novas janelas ou abas.
