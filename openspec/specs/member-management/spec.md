# member-management Specification

## Purpose
TBD - created by archiving change dashboard-member-management. Update Purpose after archive.
## Requirements
### Requirement: Painel de Gestão de Membros
O sistema SHALL permitir que administradores visualizem e gerenciem os perfis de todos os membros cadastrados. O ponto de entrada para esta funcionalidade SHALL estar visível apenas para usuários com papel de administrador.

#### Scenario: Visualização da Lista de Membros
- **WHEN** um administrador acessa a seção de membros no painel administrativo.
- **THEN** o sistema exibe uma tabela com nome, email, papel (role) e data de cadastro.

#### Scenario: Filtro por Papel
- **WHEN** o administrador seleciona o filtro "Member".
- **THEN** o sistema exibe apenas os usuários com esse papel atribuído.

#### Scenario: Visibilidade do Card de Gerenciamento no Dashboard
- **WHEN** um usuário administrador visualiza o Dashboard.
- **THEN** o card "Gerenciamento de Membros" SHALL estar visível.
- **WHEN** um usuário comum (papel "Member") visualiza o Dashboard.
- **THEN** o card "Gerenciamento de Membros" SHALL NOT estar visível.

#### Scenario: Acesso ao Detalhe do Perfil
- **GIVEN** que o administrador está visualizando a lista de membros.
- **WHEN** o administrador clica na opção "Ver Perfil" no menu de ações de um usuário.
- **THEN** o sistema SHALL redirecionar o administrador para a página de perfil do usuário selecionado.

### Requirement: Convite de Novos Membros
O sistema SHALL permitir que administradores enviem convites para novos membros via email para integração na plataforma.

#### Scenario: Envio de Convite com Sucesso
- **WHEN** o administrador abre o formulário de "Novo Membro", insere um email válido e clica em "Enviar Convite".
- **THEN** o sistema SHALL invocar o backend para disparar um convite via Supabase Auth.
- **THEN** o sistema SHALL exibir uma confirmação de sucesso para o administrador.
- **THEN** o novo membro SHALL aparecer na lista de usuários (ou a lista deve ser recarregada).

#### Scenario: Falha ao Enviar Convite (Email Duplicado ou Inválido)
- **WHEN** o administrador tenta convidar um email que já está cadastrado ou possui formato inválido.
- **THEN** o sistema SHALL exibir uma mensagem de erro clara explicando o motivo da falha.

### Requirement: Modificação de Permissões
O sistema SHALL permitir que administradores alterem o nível de acesso (Role), o status de diretoria, o status de conselho transversal e as informações básicas de perfil de outros membros de forma atômica e persistente.

#### Scenario: Promoção a Administrador e Atualização de Dados
- **WHEN** o administrador edita um membro, alterando seu papel para "Admin" e atualizando seu nome completo.
- **THEN** o sistema SHALL atualizar ambos os campos no banco de dados em uma única operação ou garantir que ambas as mudanças sejam persistidas.
- **THEN** o sistema SHALL recarregar a lista de membros para refletir as alterações imediatamente na interface.

#### Scenario: Atribuição de Cargo da Diretoria
- **WHEN** o administrador edita um membro e seleciona um cargo como "Presidente".
- **THEN** o sistema SHALL persistir o cargo e marcar o usuário como membro da diretoria.

#### Scenario: Configuração de Membro do Conselho Transversal
- **WHEN** o administrador edita um membro e ativa a opção "Membro do Conselho Transversal".
- **THEN** o sistema SHALL adicionar o papel de `transversal_council` ao perfil do usuário e persistir a alteração.
- **AND** a interface SHALL refletir que o usuário agora possui responsabilidades de moderação.

#### Scenario: Restrição de Acesso Comum
- **WHEN** um usuário com papel "Member" tenta acessar a URL `/admin-panel` ou a gestão de membros.
- **THEN** o sistema o redireciona automaticamente para o dashboard comum e exibe erro de permissão.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Remoção de Membros
O sistema **SHALL** permitir que administradores revoguem permanentemente o acesso de membros e removam suas contas da plataforma de forma segura.

#### Scenario: Remoção de Usuário com Diálogo de Confirmação
- **GIVEN** que o administrador está visualizando a lista de membros.
- **WHEN** o administrador seleciona a opção "Remover Acesso" para um usuário específico.
- **THEN** o sistema **SHALL** exibir um diálogo de confirmação solicitando que o administrador confirme a intenção de exclusão permanente.
- **WHEN** o administrador confirma a ação no diálogo.
- **THEN** o sistema **SHALL** invocar o backend para excluir o registro do perfil do usuário e sua respectiva conta no Supabase Auth.
- **AND** o sistema **SHALL** exibir um alerta de sucesso e recarregar a lista de usuários.

#### Scenario: Proteção contra Auto-Exclusão
- **WHEN** um administrador tenta acionar a opção "Remover Acesso" para sua própria conta através do painel.
- **THEN** o sistema **SHALL** impedir a ação (seja ocultando o botão ou exibindo um erro de validação), garantindo que um administrador não remova seu próprio acesso acidentalmente.

