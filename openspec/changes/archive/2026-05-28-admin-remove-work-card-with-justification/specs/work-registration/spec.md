## MODIFIED Requirements

### Requirement: Tabbed Work Mural
O Mural de Trabalho SHALL organizar as atividades em abas baseadas em seu status operacional, e **MUST NOT** exibir atividades que foram administrativamente removidas ou rejeitadas.

#### Scenario: Switching tabs
- **WHEN** o usuário seleciona a aba "Em Execução"
- **THEN** o sistema SHALL exibir apenas atividades com status `in_progress`.

#### Scenario: Ocultação de atividades removidas
- **WHEN** uma atividade é removida/arquivada por um administrador.
- **THEN** o Mural de Trabalho SHALL ocultar imediatamente essa atividade de todas as abas públicas.
