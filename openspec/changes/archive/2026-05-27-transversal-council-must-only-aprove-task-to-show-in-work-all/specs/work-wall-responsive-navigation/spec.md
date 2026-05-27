## ADDED Requirements

### Requirement: Ocultação de Tarefas Pendentes
O Mural de Trabalho **SHALL** ocultar tarefas em status `pending_approval` e `rejected` para usuários comuns, garantindo que apenas tarefas aprovadas ou em andamento sejam visíveis.

#### Scenario: Visualização do mural por usuário padrão
- **WHEN** um usuário padrão (sem a role `admin` ou `transversal_council`) acessa a aba "Todos" no Mural de Trabalho.
- **THEN** nenhuma tarefa com o status `pending_approval` ou `rejected` **SHALL** ser exibida, a menos que o usuário seja o criador (`requester_id`) da tarefa.

#### Scenario: Visualização do mural por conselheiro transversal
- **WHEN** um conselheiro transversal acessa o Mural de Trabalho.
- **THEN** ele **SHALL** ser capaz de ver as tarefas pendentes, seja em sua aba dedicada ("Moderação") ou misturadas (dependendo da lógica da aba Todos).
