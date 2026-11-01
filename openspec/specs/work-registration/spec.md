# work-registration Specification

## Purpose
TBD - created by archiving change user-register-work-done. Update Purpose after archive.
## Requirements
### Requirement: Registro de Contribuições Individuais
O sistema **SHALL** permitir que qualquer usuário autenticado registre uma atividade realizada em prol da comunidade ou de outro membro, **com ou sem evidência** — a evidência é opcional e sua ausência **MUST NOT** impedir a submissão. Todas as metadatas (título e descrição) **MUST** ser armazenadas como objetos internacionalizados (JSONB) para garantir a correta exibição na interface em diferentes idiomas.

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

#### Scenario: Evidência opcional no registro de contribuição
- **WHEN** O usuário preenche a descrição e o valor da contribuição e submete o formulário sem anexar foto, documento ou link de evidência.
- **THEN** O sistema aceita a submissão e cria a contribuição em estado de validação pendente.
- **AND** O sistema **MUST NOT** bloquear a submissão, exibir erro ou destacar a evidência como campo obrigatório.

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

### Requirement: Aviso do destino do trabalho registrado
O formulário de registro de trabalho SHALL informar ao membro, antes do envio, que o trabalho registrado vai diretamente para a coluna "Para Validar" do Mural, sem passar pelas colunas "Aberta" e "Em Execução".

#### Scenario: Aviso visível no formulário
- **WHEN** o membro abre o formulário de registro de trabalho
- **THEN** o formulário SHALL exibir um aviso informando que, após o envio e a aprovação, o trabalho vai direto para a coluna "Para Validar"
- **AND** o aviso SHALL estar visível sem exigir nenhuma interação do membro

#### Scenario: Aviso no idioma ativo
- **WHEN** o idioma ativo é português ou inglês
- **THEN** o aviso SHALL ser exibido no idioma ativo, com o nome da coluna igual ao exibido no Mural

### Requirement: Protocolo opcional em tarefas e demandas
Os formulários de criação de tarefa, criação de demanda e edição de tarefa ou demanda do mural SHALL oferecer um campo opcional de pesquisa e seleção de um protocolo/POP ativo, e o detalhe da atividade SHALL exibir o protocolo vinculado.

#### Scenario: Selecionar um protocolo ao criar
- **WHEN** o membro digita parte do título no campo de protocolo e escolhe um item da lista
- **THEN** a atividade SHALL ser criada vinculada a esse protocolo

#### Scenario: Campo opcional
- **WHEN** o membro envia o formulário sem escolher protocolo
- **THEN** a atividade SHALL ser criada normalmente, sem protocolo

#### Scenario: Alterar ou remover o protocolo na edição
- **WHEN** o solicitante edita a atividade e troca ou limpa o protocolo
- **THEN** o vínculo SHALL ser atualizado ou removido conforme a escolha

#### Scenario: Protocolo arquivado não pode ser escolhido
- **WHEN** o servidor recebe o vínculo a um protocolo arquivado ou inexistente
- **THEN** a chamada SHALL falhar sem criar ou alterar a atividade
- **AND** a atividade que já usa um protocolo depois arquivado SHALL poder ser editada mantendo-o

#### Scenario: Protocolo exibido no detalhe
- **WHEN** a atividade tem um protocolo vinculado
- **THEN** o detalhe SHALL exibir o título do protocolo e permitir abrir o texto completo

### Requirement: Explicação da regra de confirmação nos formulários
Os formulários de criação de tarefa, criação de demanda e registro de trabalho SHALL exibir, antes do envio, um aviso que explique quem confirma a atividade e quantas confirmações bastam para concluí-la, de acordo com a regra que será aplicada.

#### Scenario: Criação de tarefa ou demanda
- **WHEN** o membro abre o formulário de criação de tarefa ou de demanda
- **THEN** o formulário SHALL informar que o solicitante ou um administrador confirma o trabalho
- **AND** SHALL informar que uma única confirmação conclui a atividade e paga a recompensa
- **AND** SHALL informar que, em regra, quem executa não confirma o próprio trabalho

#### Scenario: Registro de trabalho para a Tekuá
- **WHEN** o membro abre o registro de trabalho com o beneficiário Tekuá
- **THEN** o formulário SHALL informar que membros da Vila e do Conselho confirmam o trabalho
- **AND** SHALL informar que a atividade é concluída ao atingir o número de confirmações definido pela Governança

#### Scenario: Registro de trabalho para um membro
- **WHEN** o membro seleciona outro membro como beneficiário no registro de trabalho
- **THEN** o aviso SHALL mudar para informar que somente o membro indicado ou um administrador confirma
- **AND** SHALL informar que uma única confirmação conclui a atividade

#### Scenario: Aviso no idioma ativo
- **WHEN** o idioma ativo é português ou inglês
- **THEN** o aviso SHALL ser exibido no idioma ativo

### Requirement: Campo de número de confirmações somente quando tem efeito
O sistema SHALL oferecer o campo "Número de Confirmações" somente quando a atividade usa confirmação pela comunidade; nos formulários de criação de tarefa e de demanda, onde a aprovação é do solicitante, o campo SHALL NOT ser exibido.

#### Scenario: Formulários de criação sem o campo
- **WHEN** o membro abre o formulário de criação de tarefa ou de demanda
- **THEN** o campo "Número de Confirmações" SHALL NOT ser exibido

#### Scenario: Edição de atividade com aprovação do solicitante
- **WHEN** o solicitante edita uma atividade cuja validação é aprovação do solicitante
- **THEN** o formulário de edição SHALL NOT exibir o campo "Número de Confirmações"

#### Scenario: Edição de atividade com confirmação pela comunidade
- **WHEN** o solicitante edita uma atividade cuja validação é confirmação pela comunidade
- **THEN** o formulário de edição SHALL exibir o campo "Número de Confirmações"
