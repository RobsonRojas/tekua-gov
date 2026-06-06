## MODIFIED Requirements

### Requirement: Validação Social de Contribuições
Membros da Vila e Membros do Conselho **SHALL** confirmar a realização de trabalhos publicados no mural quando o método de validação for `community_consensus`. Se for `requester_approval`, apenas o beneficiário indicado tem permissão para confirmar o trabalho. Exceção: Administradores da plataforma (`admin`) **SHALL** ter permissão para confirmar qualquer atividade, independentemente de ser `community_consensus` ou `requester_approval`. O sistema **MUST** garantir que administradores nunca sejam bloqueados por verificações de autorização de método de validação.

#### Scenario: Validação por membro do conselho
- **WHEN** uma tarefa com `validation_method = community_consensus` é visualizada.
- **AND** o usuário logado é um membro do conselho ou administrador.
- **AND** ele confirma a atividade clicando no botão.
- **THEN** o sistema SHALL registrar a confirmação com sucesso e incrementar a contagem de validações da atividade.

#### Scenario: Validação por beneficiário único (requester_approval)
- **WHEN** uma tarefa com `validation_method = requester_approval` é visualizada.
- **AND** o usuário logado é o `requester_id` da tarefa.
- **AND** ele confirma a atividade.
- **THEN** o sistema marca a atividade como concluída imediatamente e realiza a transferência da recompensa, sem aguardar outros votos.

#### Scenario: Validação por administrador em requester_approval
- **WHEN** uma tarefa com `validation_method = requester_approval` é visualizada.
- **AND** o usuário logado é um administrador.
- **AND** ele não é o `requester_id` da tarefa.
- **AND** ele confirma a atividade.
- **THEN** o sistema SHALL registrar a confirmação com sucesso e marcar a atividade como concluída.

#### Scenario: Validação por terceiros não autorizados
- **WHEN** um usuário tenta confirmar uma tarefa configurada com `requester_approval`.
- **AND** ele não é o `requester_id` da tarefa.
- **AND** ele não é um administrador.
- **THEN** o sistema **SHALL** impedir a ação e retornar um erro "Only the requester can approve this activity".
