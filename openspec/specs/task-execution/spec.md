# task-execution Specification

## Purpose
Permitir que membros da comunidade assumam a responsabilidade por demandas abertas, acompanhem seu progresso e as submetam para validação.
## Requirements
### Requirement: Task Claiming
O sistema SHALL permitir que um membro assuma uma tarefa com status `open`, ou transicione a tarefa diretamente para `in_progress` quando ela já possuir um `worker_id` definido no momento em que se torna ativa.

#### Scenario: Successful task claim
- **WHEN** um membro clica em "Assumir Tarefa" em uma demanda aberta sem executor definido
- **THEN** o sistema SHALL atualizar a tarefa definindo o membro como `worker_id` e o status como `in_progress`.
- **AND** a tarefa SHALL deixar de ser exibida na coluna "Abertas" para outros membros.

#### Scenario: Auto-transition to in_progress on activation
- **WHEN** uma atividade se torna ativa e já possui um `worker_id` definido
- **THEN** o sistema SHALL transicionar o status da atividade diretamente para `in_progress`.

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

### Requirement: Task State Change Events
O sistema SHALL emitir eventos de sistema rastreáveis sempre que o estado de uma tarefa for alterado.

#### Scenario: Emit event on claim
- **WHEN** um membro clica em "Assumir Tarefa".
- **THEN** o sistema SHALL garantir que a mudança de status dispare o gatilho de notificação para o solicitante.

#### Scenario: Emit event on validation request
- **WHEN** o executor submete a tarefa para validação.
- **THEN** o sistema SHALL garantir que o gatilho de notificação seja disparado para as partes interessadas.

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

### Requirement: Criador pode assumir a própria tarefa
O sistema SHALL permitir que o solicitante de uma tarefa aberta a assuma, da mesma forma que qualquer outro membro, tanto pelo detalhe da tarefa quanto pelo card do mural.

#### Scenario: Criador assume a própria tarefa
- **WHEN** o criador de uma tarefa com status `open` clica em "Assumir Tarefa"
- **THEN** a tarefa SHALL passar para `in_progress` com o criador como executor
- **AND** o sistema SHALL registrar a ação no histórico da tarefa

#### Scenario: Botão habilitado para o criador
- **WHEN** o criador visualiza a própria tarefa aberta
- **THEN** o botão "Assumir Tarefa" SHALL estar habilitado

#### Scenario: Servidor aceita a chamada do criador
- **WHEN** o servidor recebe `claimTask` do criador de uma tarefa aberta
- **THEN** o servidor SHALL aceitar a chamada e NOT recusá-la por o usuário ser o solicitante

#### Scenario: Tarefa já assumida continua protegida
- **WHEN** duas pessoas, incluindo o criador, tentam assumir a mesma tarefa
- **THEN** somente a primeira SHALL ter sucesso
- **AND** a outra SHALL receber o erro de tarefa já assumida ou não mais aberta

### Requirement: Descrição da tarefa contida na largura do card
A descrição exibida no detalhe da tarefa SHALL permanecer dentro da largura do card, quebrando palavras e URLs longas, e SHALL preservar as quebras de linha digitadas pelo autor.

#### Scenario: URL longa na descrição
- **WHEN** a descrição contém uma URL ou palavra mais longa que a largura do card
- **THEN** o texto SHALL quebrar em mais de uma linha dentro do card
- **AND** a descrição SHALL NOT causar rolagem horizontal nem ser cortada

#### Scenario: Quebras de linha preservadas
- **WHEN** a descrição contém linhas separadas por quebra de linha
- **THEN** o detalhe SHALL exibir as linhas separadas como digitadas
