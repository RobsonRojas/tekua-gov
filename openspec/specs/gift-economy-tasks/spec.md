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
- **WHEN** um outro membro clica em "Assumir Tarefa".
- **THEN** o status muda para "Em Execução" e o nome do executor é vinculado à tarefa.

### Requirement: Economia Surreal e Provas
O sistema SHALL garantir o reconhecimento do valor do trabalho através da moeda Surreal e evidências físicas.

#### Scenario: Envio de Prova Georreferenciada
- **WHEN** the executor clica em "Concluir Tarefa" e anexa uma foto.
- **THEN** o sistema captura as coordenadas de GPS no momento do upload e envia para validação do requisitante.

#### Scenario: Pagamento Virtual (Wallet)
- **WHEN** o requisitante clica em "Aprovar Execução" após revisar as fotos.
- **THEN** o sistema transfere o valor em Surreais do requisitante para a carteira (Wallet) do executor e gera um log de transação.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' com status inicial 'pending_approval'.

#### Scenario: Successful task creation
- **WHEN** um membro autenticado fornece título, descrição e um valor de recompensa positivo
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id` e definir o status como `pending_approval`.

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

