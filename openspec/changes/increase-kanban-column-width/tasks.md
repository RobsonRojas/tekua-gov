# Tasks: Increase Kanban Column Width & Ensure Unclipped Layout

## Implementation Tasks

- [x] **1. Set Fixed/Flexible Width on Kanban Columns (`src/components/work/KanbanColumn.tsx`)** <!-- id: 1 -->
  - Set `minWidth: '330px'`, `width: '330px' / '340px'`, and `flexShrink: 0`.
  - Ensure card titles, chip badges, and action buttons render with generous spacing without text wrapping or clipping.

- [x] **2. Adjust Board Scroll Container Padding (`src/pages/WorkWall.tsx`)** <!-- id: 2 -->
  - Configure `overflowX: 'auto'` with smooth scrollbar and padding in `WorkWall.tsx`.
  - Ensure all 5 columns can be scrolled and viewed completely with zero edge cutoff.

- [x] **3. Build & Visual Verification** <!-- id: 3 -->
  - Verify card button layout and column scroll behavior.
  - Run `npm run build` to confirm 0 compilation errors.
