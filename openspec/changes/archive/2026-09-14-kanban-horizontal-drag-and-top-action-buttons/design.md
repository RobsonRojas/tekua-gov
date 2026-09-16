# Design Specification: Kanban Horizontal Drag & Top Action Buttons

## 1. Mouse Drag-to-Scroll Implementation (`WorkWall.tsx`)

Add mouse event handlers (`onMouseDown`, `onMouseLeave`, `onMouseUp`, `onMouseMove`) to the Kanban scroll container Box:

```tsx
const [isMouseDown, setIsMouseDown] = useState(false);
const [startX, setStartX] = useState(0);
const [scrollLeft, setScrollLeft] = useState(0);

const handleMouseDown = (e: React.MouseEvent) => {
  if (!scrollContainerRef.current) return;
  setIsMouseDown(true);
  setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
  setScrollLeft(scrollContainerRef.current.scrollLeft);
};

const handleMouseLeave = () => setIsMouseDown(false);
const handleMouseUp = () => setIsMouseDown(false);

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isMouseDown || !scrollContainerRef.current) return;
  e.preventDefault();
  const x = e.pageX - scrollContainerRef.current.offsetLeft;
  const walk = (x - startX) * 1.5;
  scrollContainerRef.current.scrollLeft = scrollLeft - walk;
};
```

Apply drag styles on the board container:
```tsx
<Box
  ref={scrollContainerRef}
  onMouseDown={handleMouseDown}
  onMouseLeave={handleMouseLeave}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  sx={{
    cursor: isMouseDown ? 'grabbing' : 'grab',
    userSelect: isMouseDown ? 'none' : 'auto',
    overflowX: 'auto',
    ...
  }}
>
```

## 2. Top Action Buttons Above Board (`WorkWall.tsx`)

Add responsive action buttons directly above the board columns on mobile (`xs`), and remove fixed FABs:

```tsx
{/* Mobile Action Buttons Bar Right Above Board */}
<Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1.5, mb: 2, width: '100%' }}>
  <Button
    variant="contained"
    color="secondary"
    startIcon={<AddIcon />}
    onClick={() => navigate('/create-demand')}
    fullWidth
    sx={{ borderRadius: '12px', py: 1, fontWeight: 700, fontSize: '0.85rem' }}
  >
    {t('work.createDemand') || 'Criar Demanda'}
  </Button>
  <Button
    variant="contained"
    color="primary"
    startIcon={<AddIcon />}
    onClick={() => navigate('/register-work')}
    fullWidth
    sx={{ borderRadius: '12px', py: 1, fontWeight: 700, fontSize: '0.85rem' }}
  >
    {t('work.register') || 'Registrar Trabalho'}
  </Button>
</Box>
```
