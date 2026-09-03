# Tasks: Fix Kanban Column Clipping

- [x] 1. Em `KanbanColumn.tsx`, reverter os valores de largura (flex, minWidth, maxWidth, width) para utilizar `85vw` ou `90vw` no breakpoint `xs`.
- [x] 2. Em `KanbanColumn.tsx`, garantir que a propriedade `scrollSnapAlign` esteja configurada como `'center'`.
- [x] 3. Em `WorkWall.tsx`, alterar o contêiner do Kanban board para usar `scrollSnapType: 'x mandatory'` (exceto quando `isMouseDown` for verdadeiro).
