# gift-economy-tasks Specification

## Purpose
TBD - created by archiving change quadro-tarefas-economia-dadiva. Update Purpose after archive.
## Requirements
### Requirement: Quadro de Tarefas Comunitárias
O sistema SHALL permitir que membros acessem um quadro central para cadastrar e visualizar tarefas solicitadas pela comunidade.

#### Scenario: Cadastro de Nova Tarefa
- **WHEN** um membro autenticado descreve uma tarefa, define o valor em "Surreais" e anexa a localização geográfica aproximada.
- **THEN** a tarefa é registrada com status `pending_approval` e aguarda moderação do Conselho Transversal.

#### Scenario: Aceitação de Tarefa
- **WHEN** um ou múltiplos membros são designados ou clicam em "Assumir Tarefa".
- **THEN** o status muda para "Em Execução" e os nomes de todos os executores selecionados (array `executor_ids`) são vinculados à tarefa.

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal, com evidências físicas opcionais, estendendo as recompensas a todos os executores envolvidos. O envio de prova (foto) é opcional para concluir a tarefa.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** o executor clica em "Concluir Tarefa" e, opcionalmente, anexa uma foto.
- **THEN** quando uma foto é anexada, o sistema SHALL capturar as coordenadas de GPS no momento do upload e enviar para validação do requisitante; quando nenhuma prova é anexada, o sistema SHALL permitir a conclusão da tarefa e o envio para validação mesmo assim.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante ou administrador confirma a execução do trabalho.
- **THEN** o sistema SHALL criar (emitir a partir da Tesouraria) e creditar o valor TOTAL em Surreais correspondente na carteira (Wallet) de **CADA UM** dos executores vinculados à tarefa, e registrar as transações no ledger de forma vinculada ao ID da atividade correspondente.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' com status inicial 'pending_approval', incluindo a classificação de Urgência e Importância.

#### Scenario: Successful task creation with priority
- **WHEN** um membro autenticado fornece título, descrição, um valor de recompensa positivo e seleciona os níveis de Urgência e Importância.
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id`, definir o status como `pending_approval` e persistir os metadados de prioridade.

### Requirement: Visualização de Prioridade no Quadro
O sistema SHALL exibir visualmente os níveis de Urgência e Importância em cada card de tarefa no mural.

#### Scenario: Visualização de tags de prioridade
- **WHEN** um usuário acessa o mural de tarefas.
- **THEN** o sistema SHALL renderizar indicadores coloridos ou ícones que identifiquem claramente se a tarefa é Urgente/Não Urgente e Importante/Não Importante.

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

### Requirement: Reward Value Definition
O sistema SHALL validar que o valor da recompensa informado é um número positivo.

#### Scenario: Invalid reward amount
- **WHEN** um membro tenta criar uma tarefa com valor zero ou negativo
- **THEN** o sistema DEVE retornar um erro de validação e impedir a criação.

### Requirement: Compartilhamento de Tarefas via Link
O sistema SHALL permitir que usuários compartilhem uma tarefa específica gerando um link direto para ela.

#### Scenario: Geração de link de compartilhamento
- **WHEN** um usuário visualiza um card de tarefa no mural e clica no botão "Compartilhar".
- **THEN** o sistema SHALL copiar a URL única da tarefa para a área de transferência do usuário.

### Requirement: Task Editing Permissions
O sistema SHALL permitir que apenas o criador (requisitante) original de uma tarefa ou um administrador editem os detalhes da tarefa no mural de trabalhos (Work Wall).

#### Scenario: Requisitante Edita Detalhes da Tarefa
- **WHEN** um usuário autenticado é o criador da tarefa (possui `requester_id` igual ao seu `user_id`) e clica no botão "Editar"
- **THEN** o sistema SHALL exibir o formulário de edição com os dados atuais pré-preenchidos e permitir alterações.

#### Scenario: Administrador Edita Detalhes da Tarefa
- **WHEN** um usuário autenticado que possui a role de `admin` clica no botão "Editar" de qualquer tarefa
- **THEN** o sistema SHALL permitir a edição dos detalhes da tarefa.

#### Scenario: Usuário Comum Não Pode Editar
- **WHEN** um usuário comum (não-criador e não-administrador) acessa os detalhes da tarefa ou o card no mural
- **THEN** o sistema SHALL ocultar os controles e botões de edição, impedindo qualquer acesso visual ao formulário de alteração.

#### Scenario: Validação de Permissões no Backend
- **WHEN** uma requisição de edição via ação `updateActivity` chega ao backend
- **THEN** o sistema SHALL validar se o ID do usuário executor da requisição corresponde ao `requester_id` da atividade ou se o usuário possui perfil de administrador no banco de dados, rejeitando a operação com erro HTTP 400 ou 403 em caso negativo.

### Requirement: Wallet Deposit Notice in Task Forms
The system SHALL display a notice in the task creation and task edit forms informing users that the defined reward value will be deposited into each executor's wallet and will NOT be divided among the executors: "O valor definido será depositado na carteira de cada um dos executores. Este valor não é dividido entre os executores; cada um recebe o valor integral."

#### Scenario: Notice on task creation form
- **WHEN** a user opens the task creation form
- **THEN** the system SHALL display the wallet deposit notice near the value field, stating that the value is deposited into each executor's wallet and is not divided among the executors

#### Scenario: Notice on task edit form
- **WHEN** a user opens an existing task for editing
- **THEN** the system SHALL display the same wallet deposit notice near the value field

### Requirement: Task Title Visible on Board
The system SHALL display the title of each task on its card in the tasks board.

#### Scenario: Viewing the tasks board
- **WHEN** a user views the tasks board
- **THEN** each task card SHALL show the task's title

### Requirement: Task Search Field on Board
The system SHALL provide a text search field on the tasks board that filters tasks by title (and/or description) in addition to the existing filters.

#### Scenario: Searching by title
- **WHEN** a user types text into the search field
- **THEN** the board SHALL show only tasks whose title or description matches the search text

#### Scenario: Clearing the search
- **WHEN** the user clears the search field
- **THEN** the board SHALL show all tasks allowed by the active filters

### Requirement: Work Wall Column Search
The system SHALL provide a search input in each column of the work wall that filters the items of that column by name (task/demand title).

#### Scenario: Searching within a column
- **WHEN** a user types text into the search field of a specific column
- **THEN** only items of that column whose title matches the search text SHALL be displayed

#### Scenario: Clearing the column search
- **WHEN** the user clears the search field of a column
- **THEN** all items of that column SHALL be displayed again

