# Design Specification: Fix Header Button Clipping & Right Margin

## 1. Work Wall Page & Header Container Constraints (`WorkWall.tsx`)

Add explicit `boxSizing: 'border-box'` and right margin safety buffers to `WorkWall.tsx`:

```tsx
<Container 
  maxWidth={false} 
  disableGutters 
  sx={{ 
    py: { xs: 2, sm: 3 }, 
    px: { xs: 1.5, sm: 2, md: 3 }, 
    width: '100%', 
    maxWidth: '100%',
    boxSizing: 'border-box'
  }}
>
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justify: 'space-between', 
      alignItems: { xs: 'flex-start', sm: 'center' }, 
      gap: { xs: 1.5, sm: 2 }, 
      mb: 3, 
      width: '100%',
      boxSizing: 'border-box'
    }}
  >
    {/* Title Section */}
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, pr: 1 }}>
      <MuralIcon sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h1" fontWeight={800} sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.125rem' } }}>
          {t('work.mural')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <KanbanIcon fontSize="small" /> Quadro de Atividades (Kanban)
        </Typography>
      </Box>
    </Box>

    {/* Header Action Buttons */}
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 1, 
        width: { xs: '100%', sm: 'auto' }, 
        flexWrap: 'wrap', 
        justifyContent: { xs: 'flex-start', sm: 'flex-end' }, 
        alignItems: 'center',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />} 
        onClick={() => refetch()}
        sx={{ borderRadius: '12px', px: { xs: 1.25, sm: 1.25, md: 1.75 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {t('admin.refresh')}
      </Button>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => navigate('/create-demand')}
        color="secondary"
        sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.25, sm: 1.25, md: 1.75 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {t('work.createDemand') || 'Criar Demanda'}
      </Button>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => navigate('/register-work')}
        sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '12px', px: { xs: 1.25, sm: 1.25, md: 1.75 }, fontSize: { sm: '0.8rem', md: '0.875rem' }, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {t('work.register')}
      </Button>
    </Box>
  </Box>
```
