## ADDED Requirements

### Requirement: Contextual Feature Navigation Pattern
O sistema de navegação **SHALL** suportar padrões de navegação contextual que substituem elementos de Desktop por padrões ergonômicos mobile em funcionalidades específicas.

#### Scenario: Switching Tabs to Menu
- **WHEN** uma funcionalidade de listagem (como o Mural de Trabalho) possui filtros por abas.
- **AND** a largura da tela for inferior a 600px (`xs`).
- **THEN** o sistema **SHALL** substituir o componente de `Tabs` por um botão de menu compacto.
- **AND** o botão **SHALL** exibir o nome da categoria ou filtro atualmente selecionado.
- **AND** a seleção de um item no menu **SHALL** disparar a mesma ação que o clique em uma aba.
