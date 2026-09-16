# Tasks: Kanban Horizontal Scroll & Full Column Visibility

## Implementation Tasks

- [x] **1. Enforce Fixed Column Widths (`src/components/work/KanbanColumn.tsx`)** <!-- id: 1 -->
  - Set column flex properties to `flex: '0 0 280px'`, `minWidth: '280px'`, `flexShrink: 0` across desktop and laptop breakpoints.
  - Ensure columns maintain fixed dimensions so total board width exceeds viewport width when necessary, triggering horizontal scroll.

- [x] **2. Universal Column Navigation Pills & Custom Scrollbar (`src/pages/WorkWall.tsx`)** <!-- id: 2 -->
  - Display column navigation pills bar on both desktop and mobile viewports for one-click jumping to any column.
  - Style custom green emerald horizontal scrollbar on `scrollContainerRef`.

- [x] **3. Build & Verification** <!-- id: 3 -->
  - Verify smooth horizontal scrolling and complete visibility of all 5 columns ("Moderação", "Aberta", "Em Execução", "Para Validar", "Concluída").
