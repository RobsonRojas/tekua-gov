## MODIFIED Requirements

### Requirement: Task Progress Management
O sistema SHALL permitir que o executor (worker) transicione a tarefa para o status de validação após a conclusão, com ou sem evidências de trabalho — a evidência é opcional e sua ausência **MUST NOT** impedir a transição nem gerar erro. As evidências de trabalho, quando fornecidas, DEVEM ser exibidas em um modal integrado, garantindo que o usuário não seja redirecionado para outra aba durante a visualização.

#### Scenario: Submitting task for validation with multiple evidences
- **WHEN** o executor fornece um conjunto de arquivos ou links como evidência de conclusão.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' e armazenar todas as referências de evidência.

#### Scenario: Submitting task for validation without evidence
- **WHEN** o executor conclui a tarefa sem anexar nenhuma evidência de trabalho.
- **THEN** o sistema SHALL mudar o status da tarefa para 'pending_validation' mesmo assim, sem exigir qualquer evidência.

#### Scenario: Viewing task evidence
- **WHEN** um usuário clica em uma evidência de trabalho na página de detalhes da tarefa ou no card de atividade.
- **THEN** o sistema SHALL exibir a evidência em um modal centralizado na mesma aba, sem abrir novas janelas ou abas.

## ADDED Requirements

### Requirement: Conclusão em Passo Único
O sistema SHALL permitir que o executor conclua uma tarefa em execução diretamente a partir do Mural de Trabalho e da página de detalhes da tarefa, sem etapa obrigatória de envio de prova. O sistema SHALL tratar a conclusão como um ato do executor e SHALL rejeitar tentativas de conclusão por usuários não relacionados à atividade.

#### Scenario: Conclusão a partir do Mural de Trabalho
- **WHEN** o executor move uma tarefa em execução para a coluna de validação pendente no Mural de Trabalho.
- **THEN** o sistema SHALL concluir a tarefa sem exigir anexo de evidência e sem exigir navegação para uma etapa intermediária de prova.
- **AND** a tarefa SHALL aparecer na coluna de validação pendente.

#### Scenario: Conclusão a partir do detalhe da tarefa
- **WHEN** o executor de uma tarefa em execução aciona a ação de concluir na página de detalhes da tarefa.
- **THEN** o sistema SHALL concluir a tarefa e disponibilizá-la para validação, com ou sem evidência anexada.

#### Scenario: Conclusão por usuário não relacionado
- **WHEN** um usuário autenticado que não é executor nem administrador aciona a conclusão de uma tarefa em execução.
- **THEN** o sistema SHALL recusar a operação, mantendo a tarefa no estado de execução.

#### Scenario: Evidência posterior à conclusão
- **WHEN** o executor anexa evidência a uma tarefa que já foi concluída e submetida à validação.
- **THEN** o sistema SHALL armazenar a evidência e disponibilizá-la na visualização da atividade, sem alterar o estado de validação.
