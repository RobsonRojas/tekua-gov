## ADDED Requirements

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
