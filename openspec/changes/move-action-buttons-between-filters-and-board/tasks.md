# Tasks: Move Action Buttons Between Filters and Task Board

## Implementation Tasks

- [x] **1. Reposition Action Buttons Toolbar (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Remove action buttons cluster from the top title header.
  - Create dedicated action buttons toolbar positioned directly between `<WorkFilters />` and the task board (`<Box sx={{ flexGrow: 1, ... }}>`).
  - Configure primary buttons ("Criar Demanda", "Registrar Trabalho") and secondary button ("Atualizar") with responsive layout (`flex-wrap`, full-width on mobile, auto-width on desktop).
  - Clean up redundant mobile-only button blocks.

- [x] **2. Build & Verification** <!-- id: 2 -->
  - Verify layout order: Title → Filters → Action Buttons Toolbar → Task Board (Kanban).
  - Verify zero truncation and seamless usability on desktop, tablet, and mobile viewports.
