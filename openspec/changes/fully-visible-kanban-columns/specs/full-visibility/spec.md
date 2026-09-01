# Capability: Full Column Visibility

## Requirements

### Requirement: Simultaneous Full Visibility of All Kanban Columns
The Work Wall board MUST display all status columns simultaneously on screen without horizontal clipping on desktop viewports.

#### Scenario: Viewing board on desktop screen
- **Given** a user is viewing the Work Wall on desktop
- **When** the Kanban board renders
- **Then** all status columns (`Abertas`, `Em Execução`, `Para Validar`, `Concluídas`, `Moderação`) MUST fit 100% inside the viewport
- **And** no column MUST be clipped or cut off at the left or right edges.

#### Scenario: Mobile viewport column view
- **Given** a user is viewing the Work Wall on mobile devices (`xs`)
- **When** the Kanban board renders
- **Then** columns MUST render with touch-friendly swipeable widths (`width: '85vw'`) and zero edge clipping.
