## ADDED Requirements

### Requirement: Task Interaction System
O sistema **SHALL** permitir que membros da comunidade interajam com tarefas e contribuições através de um sistema de comentários, perguntas e solicitações de informação.

#### Scenario: Posting a question or comment
- **WHEN** um usuário autenticado visualiza os detalhes de uma tarefa e envia uma mensagem.
- **THEN** o sistema **SHALL** registrar a interação vinculada à tarefa e ao perfil do usuário.
- **AND** a mensagem **SHALL** ser exibida cronologicamente na seção de interações da tarefa.

#### Scenario: Requesting additional information
- **WHEN** um usuário posta uma interação marcada como "Solicitação de Informação".
- **THEN** o sistema **SHALL** registrar o tipo especial de interação.
- **AND** o executor (worker) da tarefa **SHALL** receber uma notificação sobre a solicitação.

#### Scenario: Viewing interaction history
- **WHEN** a página de detalhes da tarefa é aberta.
- **THEN** o sistema **SHALL** exibir todas as interações anteriores, incluindo autor, data/hora e conteúdo da mensagem.

#### Scenario: Real-time update of interactions
- **WHEN** uma nova interação é enviada com sucesso.
- **THEN** o sistema **SHALL** atualizar a lista de interações localmente sem exigir recarregamento manual da página.
