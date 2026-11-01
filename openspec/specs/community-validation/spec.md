# community-validation Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Validação Social de Contribuições
Membros da Vila e Membros do Conselho **SHALL** confirmar a realização de trabalhos publicados no mural quando o método de validação for `community_consensus`. Se for `requester_approval`, o beneficiário indicado e administradores do sistema têm permissão para confirmar o trabalho. A confirmação **SHALL** se basear na declaração do executor e no juízo de confiança dos validadores: a presença ou ausência de evidência **MUST NOT** ser critério de decisão, bloqueio ou exigência. O sistema **MUST** garantir que usuários com permissões elevadas (como conselheiros e administradores) não sejam bloqueados indevidamente por verificações de autorização ao tentar confirmar atividades de `community_consensus` ou `requester_approval`.

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

#### Scenario: Confirmação de atividade sem evidência
- **WHEN** uma atividade concluída sem nenhuma evidência anexada é confirmada por um validador autorizado.
- **THEN** o sistema SHALL registrar a confirmação normalmente.
- **AND** o sistema SHALL NOT exigir evidência, gerar erro ou sinalizar pendência de comprovação.

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

### Requirement: Centralized Validation RPC
The backend API **MUST** process all activity confirmations using the centralized `confirm_activity` database RPC to ensure consistency, security, and automated payout execution.

#### Scenario: Backend routing
- **WHEN** the `api-work` function receives a `confirmActivity` request.
- **THEN** it SHALL call the `confirm_activity` RPC instead of performing direct inserts on `activity_confirmations`.

### Requirement: Validação Baseada em Confiança Mútua
O sistema SHALL considerar a declaração do executor como suficiente para submeter uma atividade à validação, e SHALL manter a validação social (consenso da comunidade) ou a aprovação do requisitante como mecanismo de checagem e responsabilidade coletiva. A validação **MUST NOT** ser condicionada à apresentação de comprovação material.

#### Scenario: Atividade sem evidência segue para validação
- **WHEN** um executor declara uma atividade concluída sem anexar evidência alguma.
- **THEN** o sistema SHALL disponibilizar a atividade para validação pelo método configurado (`community_consensus` ou `requester_approval`).

#### Scenario: Critério de decisão independente da evidência
- **WHEN** duas atividades com o mesmo método de validação são submetidas, uma com evidência e outra sem.
- **THEN** o sistema SHALL aplicar o mesmo quórum e as mesmas regras de decisão às duas.

#### Scenario: Confirmação e pagamento sem evidência
- **WHEN** a atividade sem evidência atinge o número de confirmações exigido ou é aprovada pelo requisitante.
- **THEN** o sistema SHALL concluir a atividade e creditar a recompensa nos executores, da mesma forma que faria para uma atividade com evidência.
