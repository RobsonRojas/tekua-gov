# Design Specification: Always-Visible Executor Filter

## Component Structure (`WorkFilters.tsx`)

### Persistent Top Bar (`Box`)
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flexGrow: 1 }}>
  {/* Project Filter */}
  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { sm: 280 } }}>
    ...
  </FormControl>

  {/* Always Visible Executor Filter */}
  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, maxWidth: { sm: 280 } }}>
    <InputLabel id="executor-filter-label">{executorLabel}</InputLabel>
    <Select
      labelId="executor-filter-label"
      value={filters.workerId || ''}
      label={executorLabel}
      onChange={(e) => handleChange('workerId', e.target.value)}
      sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}
    >
      <MenuItem value="">{t('common.all') || 'Todos os Executores'}</MenuItem>
      {members.map(m => (
        <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* Toggle Filters Button */}
  <Button ...>
</Box>
```

### Collapsible Secondary Section
Contains:
- `requesterId` (Demandante)
- `type` (Tipo: Tarefa / Contribuição)
