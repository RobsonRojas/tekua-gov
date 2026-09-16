# Design Specification: Card Simplification & Form Confirmations

## 1. `ActivityCard.tsx` Header Redesign

```tsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
  <Box sx={{ color: 'text.secondary', opacity: 0.6, cursor: 'grab', display: 'flex', alignItems: 'center' }}>
    <GripVertical size={16} />
  </Box>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Trophy size={14} color="#f59e0b" />
      <Typography variant="caption" fontWeight={800} color="primary.main">
        {activity.reward_amount} $S
      </Typography>
    </Stack>
    <Tooltip title={t('common.share')}>...</Tooltip>
    ...
  </Box>
</Box>
```

## 2. `ActivityCard.tsx` Static Confirmation Label

```tsx
<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
  {t('work.confirmations')}: {confirmCount} / {threshold}
</Typography>
```

## 3. Creation Forms (`CreateDemand.tsx`, `CreateTask.tsx`)

Add:
```tsx
<Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    label={t('work.minConfirmations') || 'Número Mínimo de Confirmações'}
    type="number"
    value={minConfirmations}
    onChange={(e) => setMinConfirmations(Number(e.target.value))}
    InputProps={{ inputProps: { min: 1 } }}
    helperText="Confirmações necessárias para validação automática"
  />
</Grid>
```
