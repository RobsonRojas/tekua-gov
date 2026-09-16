# Proposal: Trello-style Kanban Board View for Work Wall

## Why

Currently, the Work Wall (`/work-wall`) displays demand cards in a single-column grid filtered by a top tab menu (`Todos`, `Aberta`, `Em Execução`, `Para Validar`, `Concluída`, `Moderação`). Users must click between tabs to see the state of tasks in different lifecycle phases. 

To improve project visibility, workflow management, and user interaction, users need a Trello-style Kanban board view where columns representing lifecycle statuses are visible side-by-side. Users should be able to drag and drop or easily move task cards between columns to change task status seamlessly.

## What

- **Kanban Column Layout**:
  - Replace the top tab navigation with horizontal Trello-style Kanban columns:
    1. **Abertas** (`open`): Demands ready to be claimed or accepted.
    2. **Em Execução** (`in_progress`): Tasks currently in progress by assigned workers/executors.
    3. **Para Validar / Aprovação** (`pending_validation` / `pending_approval`): Tasks awaiting community confirmations or requester approval.
    4. **Concluídas** (`completed`): Tasks that completed validation and payout.
    5. *(Admin / Council only)* **Moderação** (`pending_approval` council queues).
  - Column headers will display the column title, status color badge, and active task count.

- **Drag-and-Drop / Move Tasks**:
  - Enable drag-and-drop capability (HTML5 drag & drop / Touch-friendly gestures) allowing users to drag task cards into destination status columns.
  - Automatically perform status update API calls (`api-work`) when a card is dropped into a valid new column status.
  - Provide clear drag indicators, hover highlight feedback on columns, and error handling if a user attempts an invalid status transition or lacks permission.

- **Responsive & Dynamic Experience**:
  - Desktop/Tablet: Horizontal scrollable Kanban board with fixed-width columns.
  - Mobile: Smooth horizontal swipe/scroll between columns with quick-jump column selector pill menu.
  - Retain all existing filters (requester, worker, project, activity type) and real-time updates.
