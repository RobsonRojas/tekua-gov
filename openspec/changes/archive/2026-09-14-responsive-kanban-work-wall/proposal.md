# Proposal: Responsive Work Wall (Kanban) for Mobile & Desktop

## Why

The Work Wall (Kanban board) must provide a flawless user experience across all device form factors—from small smartphone screens (iOS / Android) to tablets and widescreen desktop displays. On mobile devices, columns should snap smoothly during horizontal swiping, headers should adapt without breaking, and action buttons/filters must scale seamlessly without horizontal document overflow.

## What

- **Mobile Horizontally-Snapping Column Swiper**:
  - Update `KanbanColumn.tsx` with `scrollSnapAlign: 'start'` and responsive viewport width (`85vw` on mobile, `flex: 1` on desktop).
  - Update `WorkWall.tsx` scroll container with CSS `scrollSnapType: 'x mandatory'` and smooth touch momentum scrolling (`WebkitOverflowScrolling: 'touch'`).

- **Responsive Header & Action Bar**:
  - Make `WorkWall.tsx` header stack vertically on small screens (`xs`) and align horizontally on desktop (`sm`+).
  - Ensure floating action buttons (FABs) and action buttons render cleanly across mobile and desktop breakpoints.

- **Responsive Filter Controls**:
  - Refine `WorkFilters.tsx` layout so filter inputs use responsive flex sizing (`1 1 100%` on `xs`, `1 1 200px` on `sm`+).
