## MODIFIED Requirements

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
