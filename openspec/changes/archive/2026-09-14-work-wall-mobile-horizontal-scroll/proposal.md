# Proposal: Work Wall Mobile & PWA Horizontal Scroll & Full Column Visibility

## Why

On mobile devices and inside Progressive Web Apps (PWA), the Work Wall Kanban board (`WorkWall.tsx`) currently restricts horizontal scrolling, preventing users from seeing beyond the first column (e.g., "Moderação"). This issue is caused by container overflow constraints (`overflowX: 'visible'` on `sm` breakpoint and outer layout overflow clipping), restrictive scroll snapping (`scrollSnapStop: 'always'`), missing touch action rules, and flex shrink behavior.

Users on mobile screens and PWA webviews need a fluid, responsive Kanban experience where all 5 columns ("Moderação", "Abertas", "Em Execução", "Para Validar", "Concluídas") are accessible via smooth horizontal swiping and scroll gesture navigation.

## What

- **Unrestricted Horizontal Scroll Container**:
  - Update `WorkWall.tsx` Kanban container to enforce `overflowX: 'auto'` across all screen sizes (`xs`, `sm`, `md`, `lg`).
  - Add explicit CSS `touchAction: 'pan-x pan-y'` and momentum scrolling (`WebkitOverflowScrolling: 'touch'`) to guarantee smooth PWA gesture swiping.
  - Refine `MainLayout.tsx` container rules to prevent outer layout clipping on mobile full-width views.

- **Column Sizing & Scroll Snap Polish**:
  - Update `KanbanColumn.tsx` responsive sizing (`flex: '0 0 82vw'` on `xs`, `0 0 300px` on `sm`+, `flexShrink: 0`) so each column retains an optimal width while revealing a visual edge preview of adjacent columns.
  - Change `scrollSnapStop` to `'normal'` and `scrollSnapAlign: 'start'` so swipe flings flow naturally across all columns.

- **Mobile Column Navigation Indicator**:
  - Add a lightweight, interactive column pagination/tab indicator on mobile devices (`xs`), allowing users to tap any column title ("Moderação", "Abertas", "Em Execução", "Para Validar", "Concluídas") to instantly scroll the board container to that column.
