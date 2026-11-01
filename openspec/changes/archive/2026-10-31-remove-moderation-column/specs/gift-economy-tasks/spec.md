## MODIFIED Requirements

### Requirement: Quadro de Tarefas Comunitárias
O sistema SHALL permitir que membros acessem um quadro central para cadastrar e visualizar tarefas solicitadas pela comunidade.

#### Scenario: Cadastro de Nova Tarefa
- **WHEN** um membro autenticado descreve uma tarefa, define o valor em "Surreais" e anexa a localização geográfica aproximada.
- **THEN** a tarefa é registrada diretamente com status `open` e aparece na coluna "Open" do Mural, sem etapa de moderação.

#### Scenario: Aceitação de Tarefa
- **WHEN** um ou múltiplos membros são designados ou clicam em "Assumir Tarefa".
- **THEN** o status muda para "Em Execução" e os nomes de todos os executores selecionados (array `executor_ids`) são vinculados à tarefa.

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' ou 'demand' com status inicial 'open', incluindo a classificação de Urgência e Importância.

#### Scenario: Successful task creation with priority
- **WHEN** um membro autenticado fornece título, descrição, um valor de recompensa positivo e seleciona os níveis de Urgência e Importância.
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id`, definir o status como `open` (sem moderação) e persistir os metadados de prioridade.

#### Scenario: Demanda criada entra em Open
- **WHEN** um membro autenticado cria uma demanda (`type = 'demand'`).
- **THEN** a demanda SHALL ser registrada com status `open` e aparecer imediatamente na coluna "Open" para todos os usuários.

### Requirement: Task Visibility Restrictions
The system SHALL restrict visibility of tasks based on their status.

#### Scenario: Public visibility of open tasks
- **WHEN** any user views the Work Wall.
- **THEN** tasks with `open` status SHALL be visible to everyone.

#### Scenario: Rejected tasks stay hidden
- **WHEN** a regular user views the Work Wall.
- **THEN** tasks with `rejected` status SHALL NOT be visible, unless they are the creator of the task or an administrator.
