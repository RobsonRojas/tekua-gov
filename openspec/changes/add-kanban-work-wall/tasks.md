# Tasks: Trello-style Kanban Board View for Work Wall

## Implementation Tasks

- [x] **1. Create Kanban Column Component (`src/components/work/KanbanColumn.tsx`)** <!-- id: 1 -->
  - Build vertical Kanban column layout with header (title, count badge, status color dot).
  - Implement HTML5 drop zone handlers (`onDragOver`, `onDragLeave`, `onDrop`) with visual hover indicators.
  - Support inner scrollable card list container and empty state placeholder.

- [x] **2. Add Drag Capability to Activity Cards (`src/components/ActivityCard.tsx`)** <!-- id: 2 -->
  - Add HTML5 drag properties (`draggable`, `onDragStart`, `onDragEnd`) to `ActivityCard`.
  - Add drag handle indicator icon or cursor style (`grab` / `grabbing`).
  - Attach task metadata (`taskId`, `sourceStatus`) to dataTransfer payload.

- [x] **3. Refactor Work Wall to Kanban Layout (`src/pages/WorkWall.tsx`)** <!-- id: 3 -->
  - Replace top tab list with side-by-side horizontal Kanban column layout.
  - Group fetched activities by status column (`open`, `in_progress`, `pending_validation`, `completed`, `pending_approval`).
  - Add mobile responsive view (horizontal swipeable columns + column selector pills).

- [x] **4. Implement Status Transition Logic on Drop (`src/pages/WorkWall.tsx`)** <!-- id: 4 -->
  - Handle card dropping into destination columns:
    - Moving to `in_progress`: Call claim task API.
    - Moving to `pending_validation` / `completed`: Trigger task submission / confirmation or modal.
  - Add success snackbar notifications and automatic board refetching.
  - Revert card position gracefully if status transition fails.

- [x] **5. Validate Build & Visual Polish** <!-- id: 5 -->
  - Test drag-and-drop actions across columns.
  - Run `npm run build` to verify 0 TypeScript/Vite compilation errors.
