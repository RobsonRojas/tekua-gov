# Capability: Kanban Work Wall Board

## Requirements

### Requirement: Trello-style Kanban Columns Layout
The Work Wall (`WorkWall.tsx`) MUST display demand cards organized in side-by-side status columns instead of single-tab filtered lists.

#### Scenario: Displaying Kanban columns
- **Given** a user is viewing the `/work-wall` page
- **When** the page loads successfully
- **Then** the UI MUST display distinct vertical columns for status categories (`Abertas`, `Em Execução`, `Para Validar`, `Concluídas`, and optional `Moderação`)
- **And** each column header MUST show the category title, status indicator badge, and total count of cards in that column.

#### Scenario: Column filtering
- **Given** active user filter selections (such as filter by requester, worker, or project)
- **When** filters are applied
- **Then** all Kanban columns MUST update reactively to display only cards matching the active filters within their respective status column.

---

### Requirement: Drag-and-Drop / Card Movement Between Columns
The system MUST allow users to move task cards from one status column to another via drag-and-drop or column drop zones.

#### Scenario: Dragging a card to a new status column
- **Given** a user with appropriate permissions drags a task card from its current column (e.g. `open`) and drops it onto a destination column (e.g. `in_progress`)
- **When** the drop event completes
- **Then** the system MUST trigger the appropriate API status transition (e.g., `claimTask` or status update)
- **And** upon API success, the card MUST transition smoothly to the destination column and update column counters.

#### Scenario: Drag-and-drop feedback and validation
- **Given** a user begins dragging a task card
- **When** hovering over valid target columns
- **Then** the target column MUST highlight with visual drop-zone feedback (e.g. subtle green border glow)
- **And** if the status transition fails or is unauthorized, an error alert MUST display and the card MUST revert to its original column.
