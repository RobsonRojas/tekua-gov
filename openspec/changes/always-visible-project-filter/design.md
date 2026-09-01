# Design Specification: Always-Visible Project Filter

## Layout Specification

### Filter Bar Component (`src/components/WorkFilters.tsx`)

The filter bar layout will be restructured into two distinct visual tiers:

1. **Top Persistent Control Bar**:
   - Contains:
     - **Project Dropdown**: `<FormControl size="small" sx={{ minWidth: 200 }}>` permanently visible.
     - **Toggle Filters Button**: "Mostrar Filtros" / "Ocultar Filtros" button with badge indicator when active filters exist.
     - **Clear Filters Button**: Appears when any filter is active.

2. **Collapsible Secondary Filters Grid**:
   - Inside `<Collapse in={expanded}>`:
     - `Solicitante` (`requesterId`)
     - `Membro Executor` (`workerId`)
     - `Tipo de Atividade` (`type`: Tarefa / Contribuição / Todos)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [ Projeto: Todos ▼ ]   [ ⚙ Mostrar Filtros ]          [ ✕ Limpar ]       │
├───────────────────────────────────────────────────────────────────────────┤
│ (Collapsed Area - revealed when expanded)                                 │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │ Solicitante          │ │ Membro Executor      │ │ Tipo de Atividade   │ │
│ └──────────────────────┘ └──────────────────────┘ └─────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

## i18n Translation Fix

Ensure key `work.project` in `pt/translation.json` and `en/translation.json` is mapped to "Projeto" and "Project" respectively, with safe fallback handling:
`t('work.project', 'Projeto')`.
