# member-management Specification

## Purpose
TBD - created by archiving change dashboard-member-management. Update Purpose after archive.
## Requirements
### Requirement: Painel de Gestão de Membros
O sistema SHALL permitir que administradores visualizem e gerenciem os perfis de todos os membros cadastrados. O ponto de entrada para esta funcionalidade SHALL estar visível apenas para usuários com pelo menos um papel de administrador.

#### Scenario: Visualização da Lista de Membros
- **WHEN** um administrador acessa a seção de membros no painel administrativo.
- **THEN** o sistema exibe uma tabela com nome, email, todos os papéis (roles) e funções atribuídas, e data de cadastro.

#### Scenario: Filtro por Papel
- **WHEN** o administrador seleciona um filtro de papel (ex: "Member").
- **THEN** o sistema exibe usuários que possuem ESSE papel entre seus papéis atribuídos.

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
O sistema SHALL permitir que administradores adicionem novos membros à plataforma, fornecendo no mínimo o Nome, Papel (Role) e o Endereço de E-mail. O e-mail **MUST** ser validado e salvo obrigatoriamente no banco de dados para garantir que o membro possa ser contatado e consiga realizar o login posteriormente.

#### Scenario: Cadastro com Sucesso
- **WHEN** o administrador preenche o formulário de "Novo Membro" com Nome, Papel e um E-mail válido e clica em "Salvar".
- **THEN** o sistema SHALL criar o usuário e salvar todos os dados fornecidos, incluindo o e-mail, nas respectivas tabelas do banco de dados (ex: perfis e auth).

#### Scenario: Prevenção de Cadastro Sem E-mail
- **WHEN** o administrador tenta salvar o formulário sem fornecer o E-mail.
- **THEN** o sistema SHALL bloquear a submissão e exibir um aviso de que o E-mail é um campo obrigatório.

### Requirement: Modificação de Permissões
O sistema SHALL permitir que administradores gerenciem a coleção de papéis (Roles) e funções de outros membros de forma atômica e persistente.

#### Scenario: Atribuição de Múltiplos Papéis
- **WHEN** o administrador edita um membro e seleciona tanto "Admin" quanto "Membro do Conselho Transversal".
- **THEN** o sistema SHALL persistir ambos os papéis no perfil do usuário.

#### Scenario: Atribuição de Cargo da Diretoria
- **WHEN** o administrador edita um membro e seleciona um ou mais cargos (ex: "Presidente", "Diretor").
- **THEN** o sistema SHALL persistir todos os cargos selecionados no perfil do usuário.

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
- **THEN** o sistema **SHALL** exibir um diálogo de confirmação contendo o nome ou email do usuário selecionado explicitamente na mensagem.
- **AND** o sistema **SHALL** manter os dados do usuário selecionado em memória durante a exibição do diálogo.
- **WHEN** o administrador confirma a ação no diálogo.
- **THEN** o sistema **SHALL** invocar o backend para excluir o registro do perfil do usuário e sua respectiva conta no Supabase Auth.
- **AND** o sistema **SHALL** exibir um alerta de sucesso e recarregar a lista de usuários após a conclusão da operação.

#### Scenario: Proteção contra Auto-Exclusão
- **WHEN** um administrador tenta acionar a opção "Remover Acesso" para sua própria conta através do painel.
- **THEN** o sistema **SHALL** impedir a ação (seja desabilitando/ocultando o botão ou exibindo um erro de validação), garantindo que um administrador não remova seu próprio acesso acidentalmente.

### Requirement: Upload e Armazenamento de Foto do Membro
O sistema SHALL permitir que administradores façam upload de uma foto de perfil (avatar) ao convidar ou editar qualquer membro da plataforma.

#### Scenario: Upload de Foto de Novo Membro no Convite
- **WHEN** o administrador preenche o formulário de "Novo Membro", seleciona uma imagem de perfil e clica em "Enviar".
- **THEN** o sistema SHALL enviar a imagem para o bucket `member-photos` no Supabase Storage, associar a URL gerada ao metadado do convite e salvá-la no campo `avatar_url` da tabela de perfis.

#### Scenario: Upload de Foto de Membro Existente na Edição
- **WHEN** o administrador edita um membro, seleciona ou altera a imagem de perfil no modal de edição e clica em "Salvar".
- **THEN** o sistema SHALL enviar a imagem para o bucket `member-photos` no Supabase Storage e atualizar o campo `avatar_url` correspondente na tabela de perfis.

#### Scenario: Exibição da Foto na Tabela de Membros e no Perfil
- **WHEN** a tabela de gestão de membros ou a página de perfil do usuário é renderizada.
- **THEN** o sistema SHALL exibir a foto contida em `avatar_url` no componente de Avatar. Se a foto não existir, o sistema SHALL exibir as iniciais do usuário como fallback.

