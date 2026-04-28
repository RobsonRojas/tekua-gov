# work-registration Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Registro de Contribuições Individuais
O sistema **SHALL** permitir que qualquer usuário autenticado registre uma atividade realizada em prol da comunidade ou de outro membro.

#### Scenario: Submissão com sucesso para a Tesouraria
- **WHEN** O usuário preenche descrição, sugere um valor, anexa uma evidência e seleciona "Tekuá" como beneficiária.
- **THEN** Uma nova contribuição é criada com status `pending` e vinculada à Tesouraria.

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
O Mural de Trabalho SHALL organizar as atividades em abas baseadas em seu status operacional.

#### Scenario: Switching tabs
- **WHEN** o usuário seleciona a aba "Em Execução"
- **THEN** o sistema SHALL exibir apenas atividades com status `in_progress`.

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

