# Proposal: Kanban Horizontal Drag-to-Scroll & Top Action Buttons Above Board

## Why

Users on desktop browsers, mobile emulators, and PWA apps reported two main issues on the Work Wall (`WorkWall.tsx`):
1. **Horizontal Scroll & Drag**: Standard horizontal scroll relies solely on touch swiping or shift-scroll wheels. Users cannot click and drag horizontally with a mouse to navigate between columns, leading to difficulty viewing hidden columns ("Abertas", "Em Execução", "Para Validar", "Concluídas").
2. **Action Button Position**: Floating action buttons (FABs) fixed at the bottom-right corner (`bottom: 150`, `bottom: 85`) obscure task cards in the bottom of columns and overlap with mobile navigation UI.

Users need intuitive horizontal mouse drag-to-scroll functionality across all Kanban columns and action buttons for creating demands and registering work positioned cleanly **right above the task board**.

## What

- **Mouse Drag-to-Scroll & Smooth Navigation**:
  - Implement full mouse drag-to-scroll logic (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`) on the Kanban board container in `WorkWall.tsx`.
  - Add grab/grabbing cursor pointers (`cursor: 'grab'`) and preserve native touch swipe and single-tap column pill scrolling.

- **Action Buttons Above the Kanban Board**:
  - Relocate action buttons ("Criar Demanda" and "Registrar Trabalho") to render right above the Kanban task board columns on mobile devices (`xs`), adjacent to the column navigation pills.
  - Remove fixed bottom-right FABs so card content remains 100% visible and unblocked.
