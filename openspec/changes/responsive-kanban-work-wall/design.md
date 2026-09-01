# Design Specification: Responsive Work Wall (Kanban)

## 1. Kanban Scroll Container (`WorkWall.tsx`)

```tsx
<Box
  sx={{
    display: 'flex',
    gap: { xs: 2, sm: 1.5, md: 2 },
    overflowX: 'auto',
    scrollSnapType: { xs: 'x mandatory', sm: 'none' },
    WebkitOverflowScrolling: 'touch',
    pb: 4,
    pt: 1,
    minHeight: 'calc(100vh - 280px)',
    width: '100%',
    alignItems: 'stretch'
  }}
>
```

## 2. Column Snapping & Responsive Width (`KanbanColumn.tsx`)

```tsx
sx={{
  flex: { xs: '0 0 85vw', sm: '1 1 0px' },
  minWidth: { xs: '270px', sm: '220px', md: '240px' },
  maxWidth: { xs: '85vw', sm: '100%' },
  width: { xs: '85vw', sm: '100%' },
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
  ...
}}
```

## 3. Header & Filter Responsiveness (`WorkFilters.tsx` & `WorkWall.tsx`)

Stack filters and action buttons neatly on `xs` breakpoint using standard MUI responsive breakpoint objects (`{ xs: ..., sm: ... }`).
