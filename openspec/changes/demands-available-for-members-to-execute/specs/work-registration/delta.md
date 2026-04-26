## ADDED Requirements

### Requirement: Tabbed Work Mural
O Mural de Trabalho SHALL organizar as atividades em abas baseadas em seu status operacional.

#### Scenario: Switching tabs
- **WHEN** o usuário seleciona a aba "Em Execução"
- **THEN** o sistema SHALL exibir apenas atividades com status `in_progress`.

### Requirement: Advanced Filtering
O Mural de Trabalho SHALL prover filtros para refinar a lista de atividades por múltiplos critérios simultâneos.

#### Scenario: Filtering by requester
- **WHEN** o usuário seleciona um membro no filtro de "Demandante"
- **THEN** o sistema SHALL exibir apenas as atividades criadas por esse membro (`requester_id`).
