# Tasks: Kanban Dual-Axis Scroll & Viewport Fit

## Implementation Tasks

- [x] **1. Set Board Container Viewport Height Bounds (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Set `height` and `maxHeight` to `calc(100vh - 230px)` on desktop and `calc(100vh - 220px)` on mobile.
  - Retain `overflowX: 'auto'`, mouse drag-to-scroll, and touch pan properties.

- [x] **2. Configure Independent Column Vertical Scrolling (`src/components/work/KanbanColumn.tsx`)** <!-- id: 2 -->
  - Ensure header has `flexShrink: 0`.
  - Set card list Box `flexGrow: 1`, `overflowY: 'auto'`, `touchAction: 'pan-y'`, and custom scrollbars.

- [x] **3. Build & Verification** <!-- id: 3 -->
  - Verify horizontal column scrolling and vertical card list scrolling on desktop and mobile browsers.
