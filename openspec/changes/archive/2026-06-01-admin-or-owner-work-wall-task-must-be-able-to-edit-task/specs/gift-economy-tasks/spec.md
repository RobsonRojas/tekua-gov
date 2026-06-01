## ADDED Requirements

### Requirement: Task Editing Permissions
O sistema SHALL permitir que apenas o criador (requisitante) original de uma tarefa ou um administrador editem os detalhes da tarefa no mural de trabalhos (Work Wall).

#### Scenario: Requisitante Edita Detalhes da Tarefa
- **WHEN** um usuário autenticado é o criador da tarefa (possui `requester_id` igual ao seu `user_id`) e clica no botão "Editar"
- **THEN** o sistema SHALL exibir o formulário de edição com os dados atuais pré-preenchidos e permitir alterações.

#### Scenario: Administrador Edita Detalhes da Tarefa
- **WHEN** um usuário autenticado que possui a role de `admin` clica no botão "Editar" de qualquer tarefa
- **THEN** o sistema SHALL permitir a edição dos detalhes da tarefa.

#### Scenario: Usuário Comum Não Pode Editar
- **WHEN** um usuário comum (não-criador e não-administrador) acessa os detalhes da tarefa ou o card no mural
- **THEN** o sistema SHALL ocultar os controles e botões de edição, impedindo qualquer acesso visual ao formulário de alteração.

#### Scenario: Validação de Permissões no Backend
- **WHEN** uma requisição de edição via ação `updateActivity` chega ao backend
- **THEN** o sistema SHALL validar se o ID do usuário executor da requisição corresponde ao `requester_id` da atividade ou se o usuário possui perfil de administrador no banco de dados, rejeitando a operação com erro HTTP 400 ou 403 em caso negativo.
