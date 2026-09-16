# Design Specification: Kanban Work Wall Board

## Architecture Overview

This change refactors the Work Wall UI (`src/pages/WorkWall.tsx`) from a single-tab grid view into a dynamic, responsive Kanban Board layout with drag-and-drop card state transitions.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Mural de Trabalho                                    │
├───────────────┬───────────────────┬───────────────────┬────────────────┬───────────────┤
│ Abertas (3)   │ Em Execução (2)   │ Para Validar (4)  │ Concluídas (8) │ Moderação (1) │
├───────────────┼───────────────────┼───────────────────┼────────────────┼───────────────┤
│ ┌───────────┐ │ ┌───────────┐     │ ┌───────────┐     │ ┌───────────┐  │ ┌───────────┐ │
│ │ Task Card │ │ │ Task Card │ ───►│ │ Task Card │     │ │ Task Card │  │ │ Task Card │ │
│ └───────────┘ │ └───────────┘ Drag│ └───────────┘     │ └───────────┘  │ └───────────┘ │
│ ┌───────────┐ │                   │                   │                │               │
│ │ Task Card │ │                   │                   │                │               │
│ └───────────┘ │                   │                   │                │               │
└───────────────┴───────────────────┴───────────────────┴────────────────┴───────────────┘
```

## Detailed Components & Implementation Strategy

### 1. Kanban Column Data Mapping (`WorkWall.tsx`)

Columns definition structure:
```ts
interface KanbanColumn {
  id: string;
  status: string[]; // statuses matching this column
  titleKey: string;
  defaultTitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'open',
    status: ['open'],
    titleKey: 'work.open',
    defaultTitle: 'Abertas',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.04)',
    borderColor: 'rgba(59, 130, 246, 0.2)'
  },
  {
    id: 'in_progress',
    status: ['in_progress'],
    titleKey: 'work.in_progress',
    defaultTitle: 'Em Execução',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.04)',
    borderColor: 'rgba(234, 179, 8, 0.2)'
  },
  {
    id: 'pending_validation',
    status: ['pending_validation'],
    titleKey: 'work.forValidating',
    defaultTitle: 'Para Validar',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.04)',
    borderColor: 'rgba(168, 85, 247, 0.2)'
  },
  {
    id: 'completed',
    status: ['completed'],
    titleKey: 'work.completed',
    defaultTitle: 'Concluídas',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.04)',
    borderColor: 'rgba(34, 197, 94, 0.2)'
  },
  {
    id: 'moderation',
    status: ['pending_approval'],
    titleKey: 'work.moderation',
    defaultTitle: 'Moderação',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.04)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    adminOnly: true
  }
];
```

### 2. Native HTML5 Drag and Drop Integration

- Each `ActivityCard` card container is configured as `draggable={true}`.
- Handlers:
  - `onDragStart={(e) => handleDragStart(e, activity.id, activity.status)}`
  - Column `onDragOver={(e) => e.preventDefault()}` and `onDragEnter` (highlights column border).
  - Column `onDrop={(e) => handleDrop(e, column.id)}`
- Status transition mapping on drop:
  - `open` ➔ `in_progress`: triggers `claimTask` action via `api-work`.
  - `in_progress` ➔ `pending_validation`: triggers `submitEvidence` or proof submission modal.
  - `pending_validation` / `pending_approval` ➔ `completed`: triggers `confirmActivity` confirmation action.

### 3. Aesthetics & Styling

- Horizontal scroll container with custom dark scrollbar:
  `overflowX: 'auto'`, `pb: 2`, `gap: 2.5`, `display: 'flex'`.
- Columns: Fixed/min width `320px` (or `280px` on mobile), flex-shrink `0`, height `calc(100vh - 280px)`, scrollable inner cards container.
- Column header: Badge with card count, column status dot, title, quick add action.
- Card dragging effects: Opacity shift on drag, drop zone pulse border highlight.
