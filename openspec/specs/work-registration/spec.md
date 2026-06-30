# work-registration Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Registro de Contribuições Individuais
O sistema **SHALL** permitir que qualquer usuário autenticado registre uma atividade realizada em prol da comunidade ou de outro membro. Todas as metadatas (título e descrição) **MUST** ser armazenadas como objetos internacionalizados (JSONB) para garantir a correta exibição na interface em diferentes idiomas.

#### Scenario: Submissão com sucesso para a Tesouraria
- **WHEN** O usuário preenche descrição, sugere um valor, anexa uma evidência e seleciona "Tekuá" como beneficiária.
- **THEN** Uma nova contribuição é criada com status `pending` e vinculada à Tesouraria.
- **AND** O título e a descrição são armazenados como objetos de internacionalização `{ pt: "...", en: "..." }`.

#### Scenario: Submissão com sucesso para outro membro
- **WHEN** O usuário seleciona um membro específico da vila como beneficiário.
- **THEN** A contribuição é criada e o beneficiário é notificado para que possa também validar a ação.

#### Scenario: Validação de valor sugerido
- **WHEN** O usuário tenta sugerir um valor negativo ou zero.
- **THEN** O sistema impede a submissão e exibe um erro de validação.

#### Scenario: Obrigatoriedade de evidência
- **WHEN** O usuário tenta submeter o formulário sem anexar um link ou arquivo de evidência.
- **THEN** O sistema impede a submissão, destacando que a prova de trabalho é obrigatória para a transparência.

### Requirement: Tabbed Work Mural
O Mural de Trabalho SHALL organizar as atividades em abas baseadas em seu status operacional, e **MUST NOT** exibir atividades que foram administrativamente removidas ou rejeitadas.

#### Scenario: Switching tabs
- **WHEN** o usuário seleciona a aba "Em Execução"
- **THEN** o sistema SHALL exibir apenas atividades com status `in_progress`.

#### Scenario: Ocultação de atividades removidas
- **WHEN** uma atividade é removida/arquivada por um administrador.
- **THEN** o Mural de Trabalho SHALL ocultar imediatamente essa atividade de todas as abas públicas.

### Requirement: Advanced Filtering
O Mural de Trabalho SHALL prover filtros para refinar a lista de atividades por múltiplos critérios simultâneos.

#### Scenario: Filtering by requester
- **WHEN** o usuário seleciona um membro no filtro de "Demandante"
- **THEN** o sistema SHALL exibir apenas as atividades criadas por esse membro (`requester_id`).

### Requirement: Responsive Activity Updates
The Mural de Trabalho SHALL provide immediate visual feedback when an activity status changes, ensuring that the user's local state is synchronized with the backend confirmation.

#### Scenario: Immediate Feedback on Taking a Task
- **WHEN** a user clicks "Assumir Tarefa" on an open activity.
- **THEN** the system SHALL immediately update the card's status to "Em Execução" upon successful API confirmation, without requiring a manual page refresh.

### Requirement: Global Notification on Publication
O sistema SHALL notificar proativamente a comunidade sobre a criação de novas demandas.

#### Scenario: Global alert on demand creation
- **WHEN** uma nova demanda é publicada com sucesso.
- **THEN** o sistema SHALL disparar uma notificação push "Nova Oportunidade de Trabalho" para todos os membros ativos.

### Requirement: Registro de Beneficiário Específico
The system SHALL allow users to specify a particular beneficiary (`requester_id`) when registering completed work. If a beneficiary is specified, the system **MUST** automatically assign `requester_approval` as the validation method for the task.

#### Scenario: Submitting work with a beneficiary
- **WHEN** a user registers work and provides a valid `requester_id`.
- **THEN** the system SHALL set the task's validation method to `requester_approval`.
- **AND** it SHALL bypass the `community_consensus` default, meaning no community votes will be required or accepted.

#### Scenario: Submitting work without a beneficiary
- **WHEN** a user registers work without providing a `requester_id`.
- **THEN** the system SHALL default the task's validation method to `community_consensus`.

### Requirement: Registro de Trabalho em Nome de Outro Membro
The system SHALL allow an authenticated user to register a work activity on behalf of one or more members, specifying those members as the actual executors (authors) of the work. Se não houver seleção, o sistema deve registrar a tarefa em nome do próprio usuário autenticado.

#### Scenario: Registering work for multiple members
- **WHEN** a user fills out the work registration form and selects dois ou mais membros no campo de executores.
- **AND** submits the form.
- **THEN** the system SHALL create the activity and assign todos os membros selecionados como os verdadeiros autores/executores (`executor_ids`).
- **AND** the rewards and validation flows SHALL target os selecionados.

#### Scenario: Registering work for self
- **WHEN** a user fills out the work registration form and does NOT select a different member (or selects themselves).
- **THEN** the system SHALL default the executor(s) to the currently authenticated user.

