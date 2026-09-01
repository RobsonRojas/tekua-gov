# Tasks: Full-Width Kanban Board & Remove Column Filter Pills

## Implementation Tasks

- [x] **1. Remove Column Filter Pill Menu (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Delete `activeColumnFilter` state and the top column filter pill menu row (`Todas as Colunas`, `Abertas`, etc.).
  - Always render all status columns (`columnDefs`) side-by-side.

- [x] **2. Expand Board Container to Full Width (`src/pages/WorkWall.tsx`)** <!-- id: 2 -->
  - Set `<Container maxWidth={false}>` with fluid padding `px: { xs: 2, sm: 3, md: 4 }`.
  - Remove fixed width constraints on board wrapper.

- [x] **3. Adjust Flexible Sizing for Kanban Columns (`src/components/work/KanbanColumn.tsx`)** <!-- id: 3 -->
  - Update `KanbanColumn` width/flex properties (`flex: '1 1 260px'`, `minWidth: '260px'`) so columns distribute fluidly across the screen without edge clipping.

- [x] **4. Build & Visual Verification** <!-- id: 4 -->
  - Verify layout responsiveness across desktop and mobile screens.
  - Run `npm run build` to verify clean build with 0 TypeScript errors.
