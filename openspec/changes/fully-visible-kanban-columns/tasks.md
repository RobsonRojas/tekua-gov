# Tasks: Fully Visible Kanban Board Columns

## Implementation Tasks

- [x] **1. Enable Fluid Column Widths (`src/components/work/KanbanColumn.tsx`)** <!-- id: 1 -->
  - Set `flex: { xs: '0 0 85vw', sm: '1 1 0px' }`, `minWidth: { xs: '260px', sm: 0 }`, and `flexShrink: { xs: 0, sm: 1 }`.
  - Allow all status columns to shrink proportionally and fit 100% within the viewport on desktop screens.

- [x] **2. Optimize Card Layout for Compact Widths (`src/components/ActivityCard.tsx`)** <!-- id: 2 -->
  - Adjust title font size (`fontSize: { xs: '1rem', sm: '0.95rem', md: '1.05rem' }`), button padding, and avatar sizes so card actions fit cleanly without text overflow inside fluid columns.

- [x] **3. Update Work Wall Container (`src/pages/WorkWall.tsx`)** <!-- id: 3 -->
  - Set `<Container maxWidth={false}>` with `px: { xs: 1.5, sm: 2, md: 3 }` and `gap: { xs: 1.5, sm: 1, md: 1.5 }`.
  - Eliminate area limits and edge column clipping.

- [x] **4. Build & Visual Verification** <!-- id: 4 -->
  - Verify full visibility of all columns on desktop and mobile.
  - Run `npm run build` to confirm 0 compilation errors.
