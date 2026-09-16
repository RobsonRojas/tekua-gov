# Proposal: Fully Visible Kanban Board Columns Across Displays

## Why

Currently, fixed pixel min-widths (330px-340px) on `KanbanColumn.tsx` force the board to overflow horizontally, causing the outer columns (`Abertas` and `Moderação`) to get cut off or hidden off-screen unless the user manually scrolls horizontally.

The user requires that all columns on the board be completely visible simultaneously across desktop displays without area limits or clipped edge columns.

## What

- **Fully Visible Column Sizing**:
  - Update `KanbanColumn.tsx` with responsive fluid flex sizing (`flex: '1 1 0px'`, `minWidth: 0`, `width: 'auto'`) on desktop (`sm` and up) so all status columns fit 100% within the screen viewport simultaneously.
  - Optimize inner card padding (`ActivityCard.tsx` and `KanbanColumn.tsx`) and text sizing so titles, tags, badges, and action buttons fit gracefully inside compact column widths.

- **Unconstrained Board Layout**:
  - Update `WorkWall.tsx` container padding and gap properties (`gap: { xs: 1.5, sm: 1, md: 1.5 }`, `px: { xs: 1, sm: 1.5, md: 2 }`) to utilize 100% of available viewport width without edge clipping.
