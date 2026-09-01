# Design Specification: Fully Visible Kanban Board Columns

## Layout & Fluid Sizing Specification

### 1. `KanbanColumn.tsx`

```ts
sx={{
  flex: { xs: '0 0 85vw', sm: '1 1 0px' },
  minWidth: { xs: '260px', sm: 0 },
  maxWidth: { xs: '85vw', sm: '100%' },
  width: { xs: '85vw', sm: '100%' },
  flexShrink: { xs: 0, sm: 1 },
  height: '100%',
  ...
}}
```

- On desktop (`sm` and up), all columns have equal flex share (`1 1 0px`) and `minWidth: 0`, guaranteeing that all 5 columns fit side-by-side inside 100% of the viewport width.

### 2. Inner Card Compact Aesthetics (`ActivityCard.tsx`)

- Reduce card action button paddings and chip sizes to fit neatly inside compact column widths.
- Ensure titles, confirm buttons, badges, and avatars render cleanly without text overflow.

### 3. `WorkWall.tsx` Container

```ts
<Container maxWidth={false} disableGutters sx={{ px: { xs: 1.5, sm: 2, md: 3 }, width: '100%' }}>
```
- Remove container margin bottlenecks and set board gap to `gap: { xs: 1.5, sm: 1, md: 1.5 }`.
