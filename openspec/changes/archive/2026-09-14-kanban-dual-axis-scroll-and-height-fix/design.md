# Design Specification: Kanban Dual-Axis Scroll & Viewport Height Optimization

## 1. Board Container Height Bounds (`WorkWall.tsx`)

Constrain the board container height dynamically so columns fit cleanly inside the viewport:

```tsx
<Box
  ref={scrollContainerRef}
  onMouseDown={handleMouseDown}
  onMouseLeave={handleMouseLeave}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  sx={{
    display: 'flex',
    gap: { xs: 2, sm: 2, md: 2.5 },
    overflowX: 'auto',
    overflowY: 'hidden',
    touchAction: 'pan-x pan-y',
    WebkitOverflowScrolling: 'touch',
    height: { xs: 'calc(100vh - 230px)', sm: 'calc(100vh - 240px)' },
    maxHeight: { xs: 'calc(100vh - 230px)', sm: 'calc(100vh - 240px)' },
    width: '100%',
    alignItems: 'stretch'
  }}
>
```

## 2. Independent Column Vertical Scrolling (`KanbanColumn.tsx`)

Ensure column Paper has `height: '100%'` and `maxHeight: '100%'` while the inner cards list Box takes `flexGrow: 1` and `overflowY: 'auto'`:

```tsx
<Paper
  id={`kanban-col-${id}`}
  elevation={0}
  sx={{
    flex: { xs: '0 0 85vw', sm: '0 0 300px', md: '1 1 300px' },
    minWidth: { xs: '270px', sm: '280px', md: '300px' },
    maxWidth: { xs: '85vw', sm: '380px', md: 'none' },
    width: { xs: '85vw', sm: '300px', md: 'auto' },
    flexShrink: 0,
    height: '100%',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}
>
  {/* Header with flexShrink: 0 */}
  <Box sx={{ p: 2, flexShrink: 0, ... }}>
    ...
  </Box>

  {/* Card list with overflowY: 'auto' */}
  <Box
    sx={{
      p: 2,
      flexGrow: 1,
      overflowY: 'auto',
      touchAction: 'pan-y',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'rgba(255,255,255,0.15)',
        borderRadius: '4px'
      }
    }}
  >
    {/* Activity Cards */}
  </Box>
</Paper>
```
