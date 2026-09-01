# Design Specification: Work Wall Mobile & PWA Horizontal Scroll

## 1. Kanban Scroll Container (`WorkWall.tsx`)

```tsx
<Box
  ref={scrollContainerRef}
  sx={{
    display: 'flex',
    gap: { xs: 2, sm: 2, md: 2.5 },
    overflowX: 'auto', // Always 'auto' across all breakpoints
    overflowY: 'hidden',
    touchAction: 'pan-x pan-y',
    WebkitOverflowScrolling: 'touch',
    scrollSnapType: { xs: 'x proximity', sm: 'none' },
    pb: 4,
    pt: 1,
    minHeight: 'calc(100vh - 280px)',
    width: '100%',
    alignItems: 'stretch',
    '&::-webkit-scrollbar': {
      height: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      bgcolor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px'
    }
  }}
>
```

## 2. Column Snapping & Responsive Sizing (`KanbanColumn.tsx`)

```tsx
<Paper
  id={`kanban-col-${id}`}
  sx={{
    flex: { xs: '0 0 82vw', sm: '0 0 300px', md: '1 1 300px' },
    minWidth: { xs: '270px', sm: '280px', md: '300px' },
    maxWidth: { xs: '82vw', sm: '380px', md: 'none' },
    width: { xs: '82vw', sm: '300px', md: 'auto' },
    flexShrink: 0,
    scrollSnapAlign: 'start',
    scrollSnapStop: 'normal', // Allow fluid flings across columns
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...
  }}
>
```

## 3. Mobile Quick Column Navigation Bar (`WorkWall.tsx`)

Add a row of compact status pills on mobile viewports (`xs` display only) above the board:
```tsx
<Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, overflowX: 'auto', pb: 1, mb: 2 }}>
  {columnDefs.map((col) => (
    <Chip
      key={col.id}
      label={`${col.title} (${getColumnActivities(col.statuses).length})`}
      onClick={() => scrollToColumn(col.id)}
      size="small"
      sx={{
        bgcolor: activeColumn === col.id ? col.color : 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontWeight: 700,
        flexShrink: 0
      }}
    />
  ))}
</Box>
```

## 4. Main Layout Integration (`MainLayout.tsx`)

Ensure `MainLayout.tsx` top-level container allows full horizontal scrolling on mobile by providing `disableGutters` or fluid width options on full-width board routes.
