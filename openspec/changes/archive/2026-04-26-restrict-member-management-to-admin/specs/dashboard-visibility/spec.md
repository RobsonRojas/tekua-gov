# Spec - Dashboard Visibility

## MODIFIED Requirements

### Requirement: Visibilidade Restrita de Membros
O card de "Gerenciamento de Membros" no dashboard principal **DEVERÁ (SHALL)** ser visível apenas para usuários com o papel (role) de 'admin'.

#### Scenario: Usuário Admin visualizando o Dashboard
- **GIVEN** que o usuário está logado como 'admin'.
- **WHEN** acessa a página inicial (Home).
- **THEN** o card "Gerenciamento de Membros" deve estar visível.

#### Scenario: Usuário Comum visualizando o Dashboard
- **GIVEN** que o usuário está logado com o papel 'member'.
- **WHEN** acessa a página inicial (Home).
- **THEN** o card "Gerenciamento de Membros" NÃO deve estar visível.
