## MODIFIED Requirements

### Requirement: Painel de Gestão de Membros
O sistema SHALL permitir que administradores visualizem e gerenciem os perfis de todos os membros cadastrados. A tabela de membros SHALL exibir, além de nome, email, papéis e data de cadastro, o **saldo atual de Surreais** de cada membro. O ponto de entrada para esta funcionalidade SHALL estar visível apenas para usuários com pelo menos um papel de administrador.

#### Scenario: Visualização da Lista de Membros com Saldo
- **WHEN** um administrador acessa a seção de membros no painel administrativo.
- **THEN** o sistema exibe uma tabela com nome, email, todos os papéis (roles), funções atribuídas, data de cadastro e o **saldo de Surreais (SR$)** de cada membro.

#### Scenario: Filtro por Papel
- **WHEN** o administrador seleciona um filtro de papel (ex: "Member").
- **THEN** o sistema exibe usuários que possuem ESSE papel entre seus papéis atribuídos, mantendo a coluna de saldo visível.

#### Scenario: Visibilidade do Card de Gerenciamento no Dashboard
- **WHEN** um usuário administrador visualiza o Dashboard.
- **THEN** o card "Gerenciamento de Membros" SHALL estar visível.
- **WHEN** um usuário comum (papel "Member") visualiza o Dashboard.
- **THEN** o card "Gerenciamento de Membros" SHALL NOT estar visível.

#### Scenario: Acesso ao Detalhe do Perfil
- **GIVEN** que o administrador está visualizando a lista de membros.
- **WHEN** o administrador clica na opção "Ver Perfil" no menu de ações de um usuário.
- **THEN** o sistema SHALL redirecionar o administrador para a página de perfil do usuário selecionado.
