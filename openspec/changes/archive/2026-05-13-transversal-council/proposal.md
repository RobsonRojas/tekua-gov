## Why

Currently, tasks and demands created on the Work Wall are immediately published with "Open" status, making them visible to all users. To ensure that community demands are aligned with institutional guidelines and quality standards, a review process is necessary. This change introduces the "Transversal Council" profile, responsible for approving new entries before they become public.

## What Changes

- **New User Profile**: Introduction of the `transversal_council` profile/role.
- **Approval Workflow**: 
    - Newly created tasks/demands will now start with a `pending_approval` status instead of `open`.
    - Items in `pending_approval` status are only visible to the creator and members of the Transversal Council.
- **Council Dashboard**: Council members will have a dedicated view (or filtered view) to see and approve/reject pending items.
- **Public Visibility**: Only items with `open` (approved) status are shown on the public Work Wall.

## Capabilities

### New Capabilities
- `transversal-council-workflow`: Defines the approval state machine, permissions for council members, and the moderation interface.

### Modified Capabilities
- `gift-economy-tasks`: Update the task creation flow to set initial status to `pending_approval` and restrict visibility of pending tasks.

## Impact

- **Database**: Update `tasks` table (or equivalent) to support `pending_approval` status and potentially a `reviewed_by` field.
- **RLS Policies**: Update Supabase Row Level Security policies to enforce visibility rules (creator + council).
- **Frontend**: 
    - Update `WorkWall.tsx` to filter out pending tasks for regular users.
    - Update `CreateTask.tsx` / `CreateDemand.tsx` to handle the new initial state.
    - New or updated Admin/Council panel for moderation.
