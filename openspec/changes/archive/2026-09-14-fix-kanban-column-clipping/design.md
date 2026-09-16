# Design: Kanban Mobile UX

## UI/UX
- Voltar a utilizar larguras flexíveis relativas (`vw`) para a responsividade das colunas no mobile, focando o usuário em apenas uma coluna por vez, o que torna a leitura dos cartões muito mais confortável.

## Technical Implementation
- **KanbanColumn.tsx**: Alterar o `flex`, `minWidth`, e `width` de `280px` para valores baseados em `vw` no breakpoint `xs` (ex: `85vw` ou `90vw`).
- **WorkWall.tsx**: Atualizar a propriedade `scrollSnapType` do contêiner do Kanban. Atualmente pode estar como `proximity` ou desativada; ela deve ser `x mandatory` (quando não estiver segurando o mouse). Em `KanbanColumn.tsx`, garantir `scrollSnapAlign: 'center'` ou `'start'`.
