# Proposal: Move Work Wall Action Buttons Between Filters and Task Board

## Why

Currently, the primary action buttons ("Criar Demanda", "Registrar Trabalho", "Atualizar") are placed in the top header bar next to the "Mural de Trabalho" title. On narrow screen widths, this header placement leads to button truncation and layout crowding.

Moving the action buttons to a dedicated toolbar **positioned between the filters bar and the task board (Kanban)** improves visual hierarchy, gives the buttons ample space to render without clipping, and fulfills the user's layout requirement.

## What

- **Header Simplification**: Remove the right action button cluster from the top title header bar in `WorkWall.tsx`.
- **Action Toolbar Placement**: Insert a dedicated action toolbar `Box` directly between `<WorkFilters />` and the Kanban board area.
- **Responsive Layout**: On desktop, align buttons cleanly to the right with full label visibility. On mobile (`xs`), render full-width action buttons for easy touch interactions.
