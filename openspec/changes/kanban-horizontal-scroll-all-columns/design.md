# Design Specification: Kanban Horizontal Scroll & Full Column Visibility

## 1. Fixed Column Widths (`KanbanColumn.tsx`)

Update column flex properties to prevent column shrinking on desktop:

```tsx
sx={{
  flex: { xs: '0 0 85vw', sm: '0 0 280px', md: '0 0 280px', lg: '0 0 300px' },
  minWidth: { xs: '270px', sm: '280px', md: '280px', lg: '300px' },
  width: { xs: '85vw', sm: '280px', md: '300px' },
  flexShrink: 0,
  scrollSnapAlign: 'start',
  height: '100%',
  maxHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  bgcolor: isDragOver ? 'rgba(16, 185, 129, 0.08)' : bgColor,
  border: `2px solid ${isDragOver ? '#10b981' : borderColor}`,
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden'
}}
```

---

## 2. Universal Navigation Pills & Scrollbar (`WorkWall.tsx`)

1. **Universal Column Pills Bar**: Make quick navigation pills available across desktop, tablet, and mobile so users can jump directly to any column (e.g. "Concluída").
2. **Styled Horizontal Scrollbar**:
```tsx
'&::-webkit-scrollbar': {
  height: '8px'
},
'&::-webkit-scrollbar-track': {
  bgcolor: 'rgba(255,255,255,0.05)',
  borderRadius: '4px'
},
'&::-webkit-scrollbar-thumb': {
  bgcolor: 'rgba(16, 185, 129, 0.4)',
  borderRadius: '4px',
  '&:hover': {
    bgcolor: 'rgba(16, 185, 129, 0.7)'
  }
}
```
