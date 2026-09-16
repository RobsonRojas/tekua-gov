# Design Specification: Increased Column Width & Unclipped Layout

## Responsive Column Sizing Specification

### `KanbanColumn.tsx`

```ts
sx={{
  flex: { xs: '0 0 85vw', sm: '0 0 320px', lg: '1 0 320px' },
  minWidth: { xs: '280px', sm: '310px' },
  maxWidth: { xs: '85vw', sm: '380px' },
  flexShrink: 0,
  height: '100%',
  ...
}}
```

- On screens where viewport width allows, columns flex smoothly up to 380px.
- Minimum column width is locked at 310px, preventing card button and text truncation.

### `WorkWall.tsx`

- `<Box>` container for columns uses:
  ```ts
  sx={{
    display: 'flex',
    gap: 2.5,
    overflowX: 'auto',
    pb: 4,
    pt: 1,
    px: 0.5,
    minHeight: 'calc(100vh - 260px)',
    width: '100%',
    alignItems: 'stretch',
    '&::-webkit-scrollbar': { height: '8px' }
  }}
  ```
