# Design Specification: Optimized Kanban Card Layout

## Visual Enhancements in `ActivityCard.tsx`

### 1. Header Flex Refactor

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <GripVertical size={15} />
      <Chip 
        label={t(`work.${localStatus}`)} 
        size="small" 
        sx={{ borderRadius: '6px', fontWeight: 600, height: 24, fontSize: '0.72rem', maxWidth: '140px' }}
      />
    </Box>
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Trophy size={14} color="#f59e0b" />
      <Typography variant="caption" fontWeight={800} color="primary.main">
        {activity.reward_amount} $S
      </Typography>
    </Stack>
  </Box>
</Box>
```

### 2. Inner Padding & Typography

- `CardContent`: `px: 2, py: 1.75, '&:last-child': { pb: 1.75 }`
- `Title`: `variant="subtitle1"`, `fontSize: '0.95rem'`, `fontWeight: 700`, `lineHeight: 1.3`
- `Description`: `variant="body2"`, `fontSize: '0.8rem'`, `WebkitLineClamp: 3`

### 3. Action Buttons & Moderation Stack

```tsx
<Stack direction={{ xs: 'row', sm: 'column', lg: 'row' }} spacing={1} sx={{ mt: 'auto' }}>
  <Button size="small" variant="contained" color="secondary" ...>
    {t('common.approve')}
  </Button>
  <Button size="small" variant="outlined" color="error" ...>
    {t('common.reject')}
  </Button>
</Stack>
```
