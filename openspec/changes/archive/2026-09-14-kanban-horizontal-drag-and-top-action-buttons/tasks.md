# Tasks: Kanban Horizontal Drag & Top Action Buttons Above Board

## Implementation Tasks

- [x] **1. Add Mouse Drag-to-Scroll to Kanban Board (`src/pages/WorkWall.tsx`)** <!-- id: 1 -->
  - Implement mouse drag state (`isMouseDown`, `startX`, `scrollLeft`) and handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`).
  - Set container `cursor` to `grab`/`grabbing` and `userSelect: 'none'` during drag.

- [x] **2. Relocate Action Buttons Above Task Board (`src/pages/WorkWall.tsx`)** <!-- id: 2 -->
  - Add mobile action buttons ("Criar Demanda" & "Registrar Trabalho") right above the Kanban task board columns.
  - Ensure full width buttons on mobile with clear labels and icons.

- [x] **3. Remove Obscuring Fixed FABs (`src/pages/WorkWall.tsx`)** <!-- id: 3 -->
  - Remove fixed bottom-right `<Fab>` components to unblock bottom-right card area.

- [x] **4. Build & Verification** <!-- id: 4 -->
  - Verify horizontal mouse drag scrolling on board container.
  - Verify mobile action buttons are placed cleanly above task board columns.
