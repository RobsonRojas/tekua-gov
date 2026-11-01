## ADDED Requirements

### Requirement: Atualização Obrigatória do Aplicativo Instalado
O sistema SHALL garantir que o usuário sempre execute a versão mais recente do portal, bloqueando o uso da aplicação e exigindo o refresh sempre que uma nova versão do PWA estiver disponível no dispositivo.

#### Scenario: Usuário em versão obsoleta
- **WHEN** uma nova versão do PWA é publicada e detectada no dispositivo do usuário
- **THEN** o sistema SHALL exigir o refresh da aplicação antes de permitir o uso do portal
- **AND** SHALL informar o usuário sobre a necessidade da atualização

#### Scenario: Atualização concluída
- **WHEN** o usuário confirma a atualização obrigatória
- **THEN** o sistema SHALL recarregar a aplicação e SHALL apresentar a nova versão em uso
