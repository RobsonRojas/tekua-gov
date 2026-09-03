# Design: Kanban Mobile Layout

## UI/UX
- Utilizar `flexbox` ou `grid` para garantir que a seção de filtros se adapte em viewports pequenos, quebrando as linhas quando necessário.
- O contêiner das colunas do Kanban deve usar `overflow-x: auto` permitindo rolagem horizontal enquanto preserva as larguras das colunas.

## Technical Implementation
- **Filter and Header Section**: Ajustar as propriedades flex (ex: `flex-wrap`, remover larguras fixas problemáticas) para a barra de ações no componente do Kanban.
- **Kanban Container**: Atualizar o wrapper das colunas (provavelmente um contêiner `flex`) para `overflow-x: auto` e `flex-wrap: nowrap` ou usar grid.
- **Kanban Column**: Garantir que as colunas possuam uma largura mínima definida (`min-width`, ex: 280px ou `85vw`) e usem `flex-shrink: 0` para não encolherem demais em dispositivos móveis.
