## MODIFIED Requirements

### Requirement: Modificação de Permissões
O sistema SHALL permitir que administradores alterem o nível de acesso (Role) e as informações básicas de perfil de outros membros de forma atômica e persistente.

#### Scenario: Promoção a Administrador e Atualização de Dados
- **WHEN** o administrador edita um membro, alterando seu papel para "Admin" e atualizando seu nome completo.
- **THEN** o sistema SHALL atualizar ambos os campos no banco de dados em uma única operação ou garantir que ambas as mudanças sejam persistidas.
- **THEN** o sistema SHALL recarregar a lista de membros para refletir as alterações imediatamente na interface.

#### Scenario: Restrição de Acesso Comum
- **WHEN** um usuário com papel "Member" tenta acessar a URL `/admin-panel` ou a gestão de membros.
- **THEN** o sistema o redireciona automaticamente para o dashboard comum e exibe erro de permissão.
