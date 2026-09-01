# Proposal: Enable Smooth Horizontal Scroll for All Kanban Columns

## Why

On desktop and laptop viewports, the 5th column ("Concluída") gets pushed past the right edge of the content area. Because `KanbanColumn.tsx` configured `flex: '1 1 250px'` for desktop breakpoints, the columns attempted to scale down inside the available width instead of enforcing a consistent column width with horizontal scroll.

By setting fixed column widths (`flex: '0 0 280px'`, `minWidth: '280px'`, `flexShrink: 0`) across all screen sizes, the Kanban board container will reliably scroll horizontally, ensuring that all 5 columns ("Moderação", "Aberta", "Em Execução", "Para Validar", "Concluída") remain 100% visible and accessible.

## What

- **Fixed Column Widths (`KanbanColumn.tsx`)**:
  - Update `Paper` flex properties to `flex: '0 0 280px'`, `minWidth: '280px'`, `flexShrink: 0` for desktop/tablet viewports (and `0 0 85vw` / `280px` for mobile).
- **Horizontal Scroll & Drag Navigation (`WorkWall.tsx`)**:
  - Enable column navigation quick-pills on all screen sizes (or desktop scroll indicators) for quick column jumping.
  - Enable smooth horizontal mouse drag, trackpad pan, and wheel scrolling on the board container.
  - Custom visible, styled horizontal scrollbar for easy desktop scroll control.
