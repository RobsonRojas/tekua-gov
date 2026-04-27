## MODIFIED Requirements

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
