## ADDED Requirements

### Requirement: Hub de Governança
O sistema SHALL centralizar todos os serviços institucionais em uma página dedicada.

#### Scenario: Acesso via Dashboard
- **WHEN** o usuário autenticado clica em "Acessar" no card de Governança na Home.
- **THEN** o sistema redireciona para a página `/governance`.

#### Scenario: Visualização de Serviços
- **WHEN** o usuário acessa `/governance`.
- **THEN** o sistema exibe cards para "Sistema de Votação", "Quadro de Tarefas" e "Documentos Oficiais".

### Requirement: Navegação Interna
O sistema SHALL permitir que membros acessem as ferramentas de governança a partir do hub central.

#### Scenario: Redirecionamento para Votação
- **WHEN** o usuário clica em "Votar" no card de Votações do Hub.
- **THEN** o sistema o leva para a área de pautas e deliberações (`/voting`).
