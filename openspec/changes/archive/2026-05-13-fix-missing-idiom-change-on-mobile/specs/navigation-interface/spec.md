## MODIFIED Requirements

### Requirement: Responsive Navigation Support
O sistema de navegação **SHALL** se adaptar dinamicamente a diferentes tamanhos de tela para garantir a melhor ergonomia e usabilidade em qualquer dispositivo.

#### Scenario: Mobile View (Smartphone)
- **GIVEN** uma largura de tela inferior a 768px.
- **WHEN** o usuário interage com a aplicação.
- **THEN** o sistema **SHALL** exibir uma Barra de Navegação Inferior (Bottom Navigation) contendo as ações principais (Dashboard, Mural, Perfil).
- **AND** o menu lateral **SHALL** ser acessível através de um menu hambúrguer para acesso a configurações e recursos administrativos.
- **AND** o seletor de idioma **SHALL** estar permanentemente visível e acessível dentro do menu hambúrguer (MobileDrawer), sem exigir rolagem excessiva para ser localizado.
