# Design Specification: Move Moderation Column First

## Column Array Order in `WorkWall.tsx`

```tsx
const columnDefs: ColumnDef[] = [
  ...(isCouncilOrAdmin ? [{
    id: 'moderation',
    statuses: ['pending_approval'],
    title: t('work.moderation') || 'Moderação',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.04)',
    borderColor: 'rgba(249, 115, 22, 0.15)',
    adminOnly: true
  }] : []),
  {
    id: 'open',
    statuses: ['open'],
    title: t('work.open') || 'Abertas',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.04)',
    borderColor: 'rgba(59, 130, 246, 0.15)'
  },
  ...
];
```
