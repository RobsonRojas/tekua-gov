## ADDED Requirements

### Requirement: Admin Panel Contextual Navigation
O Painel Administrativo **SHALL** adaptar sua navegação de ferramentas para facilitar o uso em dispositivos móveis.

#### Scenario: Mobile Mode (xs)
- **GIVEN** a visualização do Painel Admin em um dispositivo com largura < 600px.
- **THEN** o sistema **SHALL** ocultar a barra de abas administrativa.
- **AND** exibir um seletor de menu contextual contendo as ferramentas (Usuários, Configuração, Docs, Financeiro, Auditoria, Histórico).
- **AND** o seletor **SHALL** indicar qual ferramenta está ativa.

#### Scenario: Tool Selection
- **WHEN** o administrador seleciona uma nova ferramenta através do menu mobile.
- **THEN** o sistema **SHALL** atualizar o conteúdo do painel.
- **AND** sincronizar o parâmetro `tab` na URL.
- **AND** fechar o menu.
