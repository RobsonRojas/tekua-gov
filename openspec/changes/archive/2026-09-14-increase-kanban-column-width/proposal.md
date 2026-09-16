# Proposal: Increase Kanban Column Width & Ensure Unclipped Visibility

## Why

Setting columns to shrink excessively (`flex: 1 1 0px`) caused card content (titles, badges, action buttons) inside `KanbanColumn.tsx` to squeeze, wrap awkwardly, and clip text.

Columns require a comfortable minimum width (320px–340px) so card actions and information display legibly without squeezing. The board container must support smooth horizontal scrolling (`overflowX: 'auto'`) with outer padding to ensure all columns can be viewed completely without edge clipping.

## What

- **Increase Kanban Column Width**:
  - Set comfortable column width (`width: 320px`, `minWidth: 300px`, `flex: 0 0 320px` or `flex: 0 0 calc(20% - 16px)` on ultra-wide screens).
  - Prevent cards and action buttons inside columns from squeezing or getting clipped.

- **Unclipped Container & Smooth Horizontal Scrolling**:
  - Update `WorkWall.tsx` container with horizontal scroll padding (`px: 3`, `pb: 4`, `overflowX: 'auto'`) so all columns remain 100% accessible and legible across all viewports.
