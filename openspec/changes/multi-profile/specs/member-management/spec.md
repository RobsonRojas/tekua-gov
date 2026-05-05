## MODIFIED Requirements

### Requirement: Painel de Gestão de Membros
O sistema SHALL permitir que administradores visualizem e gerenciem os perfis de todos os membros cadastrados. O ponto de entrada para esta funcionalidade SHALL estar visível apenas para usuários com pelo menos um papel de administrador.

#### Scenario: Visualização da Lista de Membros
- **WHEN** um administrador acessa a seção de membros no painel administrativo.
- **THEN** o sistema exibe uma tabela com nome, email, todos os papéis (roles) e funções atribuídas, e data de cadastro.

#### Scenario: Filtro por Papel
- **WHEN** o administrador seleciona um filtro de papel (ex: "Member").
- **THEN** o sistema exibe usuários que possuem ESSE papel entre seus papéis atribuídos.

### Requirement: Modificação de Permissões
O sistema SHALL permitir que administradores gerenciem a coleção de papéis (Roles) e funções de outros membros de forma atômica e persistente.

#### Scenario: Atribuição de Múltiplos Papéis
- **WHEN** o administrador edita um membro e seleciona tanto "Admin" quanto "Membro do Conselho Transversal".
- **THEN** o sistema SHALL persistir ambos os papéis no perfil do usuário.

#### Scenario: Atribuição de Cargo da Diretoria
- **WHEN** o administrador edita um membro e seleciona um ou mais cargos (ex: "Presidente", "Diretor").
- **THEN** o sistema SHALL persistir todos os cargos selecionados no perfil do usuário.
