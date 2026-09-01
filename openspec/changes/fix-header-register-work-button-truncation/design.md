# Design Specification: Fix Header "+ Registrar Trabalho" Button Truncation

## 1. Page Container & Header Bar Layout (`WorkWall.tsx`)

Adjust page container padding and flex alignment to allow title and button group to adapt to available width:

```tsx
<Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
  <Box sx={{ 
    display: 'flex', 
    flexDirection: { xs: 'column', sm: 'row' }, 
    justifyContent: 'space-between', 
    alignItems: { xs: 'flex-start', sm: 'center' }, 
    gap: 2, 
    mb: 3, 
    width: '100%' 
  }}>
    {/* Title Section */}
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <MuralIcon sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h1" fontWeight={800} sx={{ fontSize: { xs: '1.35rem', sm: '1.8rem', md: '2.125rem' } }}>
          {t('work.mural')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <KanbanIcon fontSize="small" /> Quadro de Atividades (Kanban)
        </Typography>
      </Box>
    </Box>

    {/* Header Action Buttons */}
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      width: { xs: '100%', sm: 'auto' }, 
      flexWrap: 'wrap', 
      justifyContent: { xs: 'flex-start', sm: 'flex-end' }, 
      alignItems: 'center',
      maxWidth: '100%'
    }}>
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />} 
        onClick={() => refetch()}
        sx={{ borderRadius: '12px', px: { xs: 1.5, sm: 1.25, md: 2 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
      >
        {t('admin.refresh')}
      </Button>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => navigate('/create-demand')}
        color="secondary"
        sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.5, sm: 1.25, md: 2 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
      >
        {t('work.createDemand') || 'Criar Demanda'}
      </Button>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => navigate('/register-work')}
        sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.5, sm: 1.25, md: 2 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
      >
        {t('work.register')}
      </Button>
    </Box>
  </Box>
```
