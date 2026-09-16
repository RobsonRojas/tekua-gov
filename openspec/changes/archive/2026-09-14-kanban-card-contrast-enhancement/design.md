# Design Specification: Activity Card High Contrast Enhancement

## 1. Card Container & Border Definition (`ActivityCard.tsx`)

Enhance card surface background and outer border contrast:

```tsx
<Card
  sx={{
    bgcolor: 'rgba(26, 36, 25, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: highlighted 
      ? '0 0 15px rgba(16, 185, 129, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.25)',
    '&:hover': {
      transform: 'translateY(-3px)',
      borderColor: '#10b981',
      boxShadow: '0 6px 18px rgba(16, 185, 129, 0.2)'
    }
  }}
>
```

## 2. High-Contrast Typography & Progress (`ActivityCard.tsx`)

Elevate font colors for descriptions, progress labels, and user metadata:

```tsx
// Card Title
<Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff', fontSize: '0.97rem' }}>
  {title}
</Typography>

// Card Description
<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem', fontWeight: 500 }}>
  {description}
</Typography>

// Confirmations Stat & Progress
<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.88)', fontWeight: 700 }}>
  {t('work.confirmations')}: {confirmCount} / {threshold}
</Typography>
<Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
  {Math.min(100, progress).toFixed(0)}%
</Typography>

// Requester / Beneficiary Label
<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
  {activity.type === 'task' ? t('work.requester') : t('work.beneficiary')}: {activity.requester?.full_name || 'Tekuá'}
</Typography>
```

## 3. High-Contrast Action Buttons (`ActivityCard.tsx`)

Make card action buttons pop with solid vibrant colors and white text:

```tsx
<Button
  fullWidth
  size="small"
  variant="contained"
  startIcon={<PlayCircle size={16} />}
  onClick={handleAction}
  disabled={loading || isOwner}
  sx={{
    bgcolor: '#10b981',
    color: '#ffffff',
    borderRadius: '12px',
    py: 1,
    fontSize: '0.82rem',
    fontWeight: 800,
    textTransform: 'none',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
    '&:hover': { bgcolor: '#059669' },
    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
  }}
>
  {t('work.accept', 'Assumir Tarefa')}
</Button>
```
