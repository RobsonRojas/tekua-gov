# Design Specification: Move Action Buttons Between Filters and Task Board

## 1. Component Reorganization in `WorkWall.tsx`

### Layout Flow
1. **Header Bar**: Displays Title & Subtitle only.
2. **Alerts** (if offline).
3. **`WorkFilters`**: Render project, executor, and filter toggles.
4. **Action Toolbar** (*NEW POSITION*): Dedicated flex container for action buttons placed directly between `WorkFilters` and the Kanban task board.
5. **Kanban Board**: Drag-and-drop task columns.

---

## 2. Action Toolbar Structure & Styling

```tsx
{/* Action Buttons Toolbar (Positioned between Filters and Task Board) */}
<Box 
  sx={{ 
    display: 'flex', 
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between',
    alignItems: { xs: 'stretch', sm: 'center' },
    gap: 1.5, 
    my: 2.5, 
    width: '100%', 
    boxSizing: 'border-box' 
  }}
>
  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
    <Button 
      variant="contained" 
      color="secondary"
      startIcon={<AddIcon />} 
      onClick={() => navigate('/create-demand')}
      sx={{ 
        flex: { xs: 1, sm: 'none' },
        borderRadius: '12px', 
        px: 2.5, 
        py: 1,
        fontWeight: 700,
        fontSize: '0.875rem', 
        whiteSpace: 'nowrap' 
      }}
    >
      {t('work.createDemand') || 'Criar Demanda'}
    </Button>
    <Button 
      variant="contained" 
      color="primary"
      startIcon={<AddIcon />} 
      onClick={() => navigate('/register-work')}
      sx={{ 
        flex: { xs: 1, sm: 'none' },
        borderRadius: '12px', 
        px: 2.5, 
        py: 1,
        fontWeight: 700,
        fontSize: '0.875rem', 
        whiteSpace: 'nowrap' 
      }}
    >
      {t('work.register')}
    </Button>
  </Box>

  <Button 
    variant="outlined" 
    startIcon={<RefreshIcon />} 
    onClick={() => refetch()}
    sx={{ 
      borderRadius: '12px', 
      px: 2, 
      py: 1,
      fontSize: '0.875rem', 
      whiteSpace: 'nowrap', 
      alignSelf: { xs: 'stretch', sm: 'center' } 
    }}
  >
    {t('admin.refresh')}
  </Button>
</Box>
```
