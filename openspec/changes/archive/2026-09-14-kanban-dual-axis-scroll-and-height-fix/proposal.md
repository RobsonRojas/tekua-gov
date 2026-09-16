# Proposal: Kanban Dual-Axis (Horizontal & Vertical) Scroll & Viewport Height Optimization

## Why

Users on desktop browsers and mobile devices reported that columns with high card counts (e.g., 17 or 18 cards) extend off the bottom of the screen viewport. Without constrained column height bounds and independent vertical scrollbars, cards in lower positions become hard to reach or cut off.

Users require seamless dual-axis scrolling: horizontal navigation across all columns combined with smooth vertical scrolling inside each column and page on desktop and mobile viewports.

## What

- **Viewport Height & Vertical Column Scroll**:
  - Bound the height of the Kanban board container and columns to fit within the viewport height (`maxHeight: 'calc(100vh - 230px)'` on desktop/tablet, `maxHeight: 'calc(100vh - 210px)'` on mobile).
  - Configure each `KanbanColumn` card list container to scroll independently vertically (`overflowY: 'auto'`) with custom styled scrollbars.

- **Dual-Axis Touch & Mouse Interactions**:
  - Set `touchAction: 'pan-x pan-y'` and `WebkitOverflowScrolling: 'touch'` on board and column containers to allow fluid horizontal column swiping and vertical card list scrolling.
  - Optimize desktop mouse drag-to-scroll to preserve vertical scrolling when hovering over column card lists.
