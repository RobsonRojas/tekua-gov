## MODIFIED Requirements

### Requirement: Validação Social de Contribuições
Membros da Vila e Membros do Conselho **SHALL** confirmar a realização de trabalhos publicados no mural quando o método de validação for `community_consensus`. Se for `requester_approval`, o beneficiário indicado e administradores do sistema têm permissão para confirmar o trabalho. O sistema **MUST** garantir que usuários com permissões elevadas (como conselheiros e administradores) não sejam bloqueados indevidamente por verificações de autorização ao tentar confirmar atividades de `community_consensus` ou `requester_approval`.

Quando o beneficiário indicado (`requester_id`) também for um dos executores da atividade, ele **SHALL** poder confirmá-la em `requester_approval`, e o botão de confirmação **SHALL** estar habilitado para ele. Executores que não são o beneficiário indicado **SHALL NOT** confirmar o próprio trabalho, em nenhum método de validação. A exceção é o administrador do sistema: em `requester_approval`, ele **SHALL** poder confirmar mesmo quando também é executor da atividade, como já previsto acima.

#### Scenario: Validação por membro do conselho
- **WHEN** uma tarefa com `validation_method = community_consensus` é visualizada.
- **AND** o usuário logado é um membro do conselho ou administrador.
- **AND** ele confirma a atividade clicando no botão.
- **THEN** o sistema SHALL registrar a confirmação com sucesso e incrementar a contagem de validações da atividade.

#### Scenario: Validação por beneficiário único ou administrador (requester_approval)
- **WHEN** uma tarefa com `validation_method = requester_approval` é visualizada.
- **AND** o usuário logado é o `requester_id` da tarefa ou um administrador.
- **AND** ele confirma a atividade.
- **THEN** o sistema marca a atividade como concluída imediatamente e realiza a transferência da recompensa, sem aguardar outros votos.

#### Scenario: Validação por terceiros não autorizados
- **WHEN** um usuário tenta confirmar uma tarefa configurada com `requester_approval`.
- **AND** ele não é o `requester_id` da tarefa nem um administrador.
- **THEN** o sistema **SHALL** impedir a ação e retornar um erro "Only the requester or an administrator can approve this activity".

#### Scenario: Solicitante que também é executor confirma a tarefa
- **WHEN** uma tarefa com `validation_method = requester_approval` tem o usuário logado como `requester_id` e também em `executor_ids`.
- **AND** a tarefa está aguardando validação.
- **THEN** o botão de confirmação SHALL estar habilitado para esse usuário
- **AND** ao confirmar, o sistema SHALL marcar a atividade como concluída e realizar a transferência da recompensa para cada executor, sem recusar a confirmação por autoconfirmação.

#### Scenario: Executor que não é o solicitante tenta confirmar o próprio trabalho
- **WHEN** o usuário logado está em `executor_ids` ou é o `worker_id` da tarefa
- **AND** ele não é o `requester_id` da tarefa nem administrador em `requester_approval`
- **THEN** o botão de confirmação SHALL permanecer desabilitado
- **AND** a chamada à RPC SHALL ser rejeitada com o erro "You cannot confirm your own work".

#### Scenario: Administrador que também é executor confirma em requester_approval
- **WHEN** uma tarefa com `validation_method = requester_approval` tem um administrador em `executor_ids` ou como `worker_id`.
- **AND** a tarefa está aguardando validação.
- **THEN** o botão de confirmação SHALL estar habilitado para o administrador
- **AND** ao confirmar, o sistema SHALL concluir a atividade e realizar a transferência da recompensa para cada executor.

#### Scenario: Administrador que também é executor não confirma em community_consensus
- **WHEN** uma tarefa com `validation_method = community_consensus` tem um administrador em `executor_ids` ou como `worker_id`.
- **THEN** o botão de confirmação SHALL permanecer desabilitado para o administrador
- **AND** a chamada à RPC SHALL ser rejeitada com o erro "You cannot confirm your own work".
