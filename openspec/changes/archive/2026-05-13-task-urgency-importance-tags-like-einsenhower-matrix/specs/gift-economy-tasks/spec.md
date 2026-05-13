## MODIFIED Requirements

### Requirement: Open Task Creation
O sistema SHALL permitir que qualquer usuário autenticado crie uma atividade do tipo 'task' com status inicial 'open', incluindo a classificação de Urgência e Importância.

#### Scenario: Successful task creation with priority
- **WHEN** um membro autenticado fornece título, descrição, um valor de recompensa positivo e seleciona os níveis de Urgência e Importância.
- **THEN** o sistema SHALL registrar a tarefa vinculando o membro como `requester_id`, definir o status como `open` e persistir os metadados de prioridade.

## ADDED Requirements

### Requirement: Visualização de Prioridade no Quadro
O sistema SHALL exibir visualmente os níveis de Urgência e Importância em cada card de tarefa no mural.

#### Scenario: Visualização de tags de prioridade
- **WHEN** um usuário acessa o mural de tarefas.
- **THEN** o sistema SHALL renderizar indicadores coloridos ou ícones que identifiquem claramente se a tarefa é Urgente/Não Urgente e Importante/Não Importante.
