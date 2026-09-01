# Design Specification: Header Buttons & "Concluída" Column Clipping Fix

## 1. Header Action Buttons Responsiveness (`WorkWall.tsx`)

Add `flexWrap: 'wrap'`, compact padding, and `whiteSpace: 'nowrap'` to header buttons:

```tsx
<Box sx={{ 
  display: 'flex', 
  gap: 1, 
  width: { xs: '100%', sm: 'auto' }, 
  flexWrap: 'wrap', 
  justifyContent: { xs: 'flex-end', sm: 'flex-end' }, 
  alignItems: 'center' 
}}>
  <Button 
    variant="outlined" 
    startIcon={<RefreshIcon />} 
    onClick={() => refetch()}
    sx={{ borderRadius: '12px', px: { xs: 1.5, sm: 1.5, md: 2 }, whiteSpace: 'nowrap' }}
  >
    {t('admin.refresh')}
  </Button>
  <Button 
    variant="contained" 
    startIcon={<AddIcon />} 
    onClick={() => navigate('/create-demand')}
    color="secondary"
    sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.5, sm: 1.5, md: 2 }, whiteSpace: 'nowrap' }}
  >
    {t('work.createDemand') || 'Criar Demanda'}
  </Button>
  <Button 
    variant="contained" 
    startIcon={<AddIcon />} 
    onClick={() => navigate('/register-work')}
    sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.5, sm: 1.5, md: 2 }, whiteSpace: 'nowrap' }}
  >
    {t('work.register')}
  </Button>
</Box>
```

## 2. Column Width Sizing & Board End Padding (`WorkWall.tsx` & `KanbanColumn.tsx`)

Add horizontal padding `px` to the board container and adjust column `minWidth`:

```tsx
// WorkWall.tsx
<Box
  ref={scrollContainerRef}
  sx={{
    display: 'flex',
    gap: { xs: 1.5, sm: 2, md: 2.5 },
    px: { xs: 1.5, sm: 2, md: 3 },
    pb: 2,
    pt: 1,
    height: { xs: 'calc(100vh - 220px)', sm: 'calc(100vh - 240px)' },
    maxHeight: { xs: 'calc(100vh - 220px)', sm: 'calc(100vh - 240px)' },
    overflowX: 'auto',
    width: '100%'
  }}
>

// KanbanColumn.tsx
<Paper
  sx={{
    flex: { xs: '0 0 85vw', sm: '0 0 250px', md: '1 1 250px', lg: '1 1 270px' },
    minWidth: { xs: '270px', sm: '240px', md: '250px', lg: '270px' },
    maxWidth: { xs: '85vw', sm: '340px', md: 'none' },
    width: { xs: '85vw', sm: '250px', md: 'auto' },
    flexShrink: 0,
    ...
  }}
>
```
