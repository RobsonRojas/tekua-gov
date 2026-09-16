# Proposal: Full-Width Kanban Board & Remove Column Filter Pills

## Why

Currently, the Work Wall (`WorkWall.tsx`) container is constrained by `<Container maxWidth="xl">`, which caps the page width and clips columns at the edges on larger screens. Additionally, a top pill menu (`Todas as Colunas`, `Abertas`, `Em Execução`, etc.) was present, filtering the view down to single columns instead of displaying all Kanban columns simultaneously across the full screen width.

Users need a full-width, unconstrained Trello-style Kanban layout where all columns (`Abertas`, `Em Execução`, `Para Validar`, `Concluídas`, and `Moderação`) are displayed side-by-side without artificial container clipping or column filter tabs.

## What

- **Remove Column Filter Pills**:
  - Remove the top chip/pill menu (`Todas as Colunas`, `Abertas`, `Em Execução`, etc.) so that all columns are always rendered simultaneously.

- **Full-Width Unconstrained Board Layout**:
  - Change the page `<Container>` from fixed `maxWidth="xl"` to `maxWidth={false}` (fluid 100% width) with responsive padding.
  - Adjust column sizing (`KanbanColumn.tsx`) so columns flex fluidly (`minWidth: 260px`, `flex: 1`) to fit all status columns side-by-side cleanly across the screen.
