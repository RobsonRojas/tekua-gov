# Design Specification: Full-Width Kanban Board

## Architecture & Layout Changes

### 1. Work Wall Container (`src/pages/WorkWall.tsx`)

- Replace `<Container maxWidth="xl">` with `<Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 4 } }}>`.
- Remove `activeColumnFilter` state and the top `Chip` pills menu row.
- Render all column definitions unconditionally:
  - `Abertas`
  - `Em Execução`
  - `Para Validar`
  - `Concluídas`
  - `Moderação` (for admin / transversal council)

### 2. Kanban Column Responsive Widths (`src/components/work/KanbanColumn.tsx`)

- Update column container styles:
  ```ts
  sx={{
    flex: { sm: '1 1 260px', md: '1 1 280px' },
    minWidth: { xs: '280px', sm: '260px' },
    maxWidth: { xs: '85vw', sm: '1fr' },
    height: '100%',
    ...
  }}
  ```
- This allows columns to shrink/expand gracefully and fill 100% of the available horizontal space across the screen without clipping.
