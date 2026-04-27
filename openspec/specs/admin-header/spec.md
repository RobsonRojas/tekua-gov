# admin-header Specification

## Purpose
TBD - created by archiving change fix-admin-panel-header. Update Purpose after archive.
## Requirements
### Requirement: Refatoração do Header do Painel Admin
O título principal da página **DEVERÁ (SHALL)** ser "Painel Administrativo" e os controles de cada aba **DEVERÃO (SHALL)** estar dentro do conteúdo da própria aba.

#### Scenario: Visualização Geral do Painel
- **GIVEN** que o usuário está logado como admin.
- **WHEN** acessa `/admin-panel`.
- **THEN** o título no topo da página deve ser "Painel Administrativo".
- **THEN** não deve haver subtítulos ou botões globais acima das abas.

#### Scenario: Aba Gerenciamento de Usuários
- **GIVEN** que a aba "Gerenciamento de Usuários" está selecionada.
- **WHEN** o conteúdo é exibido.
- **THEN** deve conter o título "Gerenciamento de Usuários".
- **THEN** deve conter o subtítulo "Visualize e gerencie os membros da associação e suas permissões.".
- **THEN** deve conter o botão "Novo Membro".
- **THEN** deve conter o botão de "Refresh".

