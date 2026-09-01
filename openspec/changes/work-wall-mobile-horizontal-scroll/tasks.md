# Tasks: Work Wall Mobile & PWA Horizontal Scroll & Column Accessibility

## Implementation Tasks

- [x] **1. Enable Unrestricted Mobile & PWA Scroll Container (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Set `overflowX: 'auto'` persistently across all screen breakpoints (`xs`, `sm`, `md`, `lg`).
  - Add `touchAction: 'pan-x pan-y'` and `WebkitOverflowScrolling: 'touch'` for native mobile touch scrolling.
  - Implement `scrollContainerRef` and `scrollToColumn(columnId)` helper for column navigation.
  - Add interactive mobile column header pills (`xs`) to allow 1-tap scrolling to any Kanban column ("Moderação", "Abertas", "Em Execução", "Para Validar", "Concluídas").

- [x] **2. Refine Column Snapping & Responsive Widths (`src/components/work/KanbanColumn.tsx`)** <!-- id: 2 -->
  - Set `scrollSnapStop: 'normal'` and `scrollSnapAlign: 'start'` for natural gesture scrolling.
  - Set `flex: { xs: '0 0 82vw', sm: '0 0 300px', md: '1 1 300px' }` and `flexShrink: 0` on small screens.
  - Add HTML `id={`kanban-col-${id}`}` to anchor smooth scrolling.

- [x] **3. Update Main Layout Bounds (`src/layouts/MainLayout.tsx`)** <!-- id: 3 -->
  - Ensure main container does not constrain or clip horizontal scroll area on mobile viewports.

- [x] **4. Build & Verification** <!-- id: 4 -->
  - Verify layout responsiveness and smooth horizontal scrolling on mobile viewports and PWA view.
  - Ensure typescript type checks pass without compilation errors.
