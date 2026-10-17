## MODIFIED Requirements

### Requirement: Ocultação de Tarefas Pendentes
O Mural de Trabalho **SHALL** ocultar tarefas em status `rejected` para usuários comuns, garantindo que apenas tarefas abertas, em execução, em validação ou concluídas sejam visíveis.

#### Scenario: Visualização do mural por usuário padrão
- **WHEN** um usuário padrão (sem a role `admin` ou `transversal_council`) acessa a aba "Todos" no Mural de Trabalho.
- **THEN** nenhuma tarefa com o status `rejected` **SHALL** ser exibida, a menos que o usuário seja o criador (`requester_id`) da tarefa.

#### Scenario: Coluna Moderação removida
- **WHEN** qualquer usuário acessa o Mural de Trabalho.
- **THEN** a coluna/aba "Moderação" **SHALL NOT** ser exibida, pois a etapa de moderação não existe mais.
