## ADDED Requirements

### Requirement: Profile Contextual Navigation
O sistema de perfil **SHALL** adaptar sua navegação de seções para priorizar a área de conteúdo em dispositivos móveis.

#### Scenario: Mobile Mode (xs)
- **GIVEN** a visualização de perfil em um dispositivo com largura < 600px.
- **THEN** o sistema **SHALL** ocultar as abas de navegação horizontais.
- **AND** exibir um seletor de menu contextual contendo as seções (Informações, Segurança, Atividade, Privacidade).
- **AND** o seletor **SHALL** indicar visualmente qual seção está ativa no momento.

#### Scenario: Section Selection
- **WHEN** o usuário seleciona uma nova seção através do menu mobile.
- **THEN** o sistema **SHALL** atualizar o conteúdo da página para refletir a seção escolhida.
- **AND** fechar o menu automaticamente.
