## MODIFIED Requirements

### Requirement: Painel de Gestão de Membros
O sistema SHALL permitir que administradores visualizem e gerenciem os perfis de todos os membros cadastrados.

#### Scenario: Visualização da Lista de Membros
- **WHEN** um administrador acessa a seção de membros no painel administrativo.
- **THEN** o sistema exibe uma tabela com nome, email, papel (role) e data de cadastro.

#### Scenario: Filtro por Papel
- **WHEN** o administrador seleciona o filtro "Member".
- **THEN** o sistema exibe apenas os usuários com esse papel atribuído.

#### Scenario: Acesso ao Detalhe do Perfil
- **GIVEN** que o administrador está visualizando a lista de membros.
- **WHEN** o administrador clica na opção "Ver Perfil" no menu de ações de um usuário.
- **THEN** o sistema SHALL redirecionar o administrador para a página de perfil do usuário selecionado.
