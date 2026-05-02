## Context

The platform uses a Work Wall to manage community tasks and demands. Currently, any authenticated user can create a task, and it is immediately published as `open`. There is no quality control or institutional oversight for these community-driven requests. 

This design introduces a moderation layer where a specialized group of users, the "Transversal Council", must approve tasks before they go public.

## Goals / Non-Goals

**Goals:**
- Implement a new user role: `transversal_council`.
- Add `pending_approval` and `rejected` statuses to tasks.
- Ensure only approved tasks are visible to the general public.
- Provide a moderation interface for council members.
- Update RLS policies to enforce these visibility rules at the database level.

**Non-Goals:**
- modifying the task execution flow (once approved, tasks behave normally).
- Implementing complex multi-step approval (single approval is sufficient).

## Decisions

### 1. Task Status Extension
We will extend the `status` field in the `activities` (or `tasks`) table to include:
- `pending_approval`: Initial state for all new tasks.
- `rejected`: State for tasks deemed inappropriate or out of scope.
- `open`: State after approval (existing).

> [!IMPORTANT]
> To avoid Postgres transaction issues (`unsafe use of new value`), the enum update must be committed in a separate migration before being used in column defaults or RLS policies.

### 2. Role: `transversal_council`
We will add `transversal_council` as a valid role in the system. 
- In the frontend, we'll check for this role to show moderation tools.
- In the backend, we'll use this role in RLS policies.

### 3. Database RLS Policies
The `SELECT` policy for the `activities` table will be updated:
- Allow viewing if `status = 'open'`.
- Allow viewing if `auth.uid() = creator_id` (regardless of status).
- Allow viewing if `current_user_has_role('transversal_council')` or `current_user_has_role('admin')`.

The `UPDATE` policy will allow `transversal_council` and `admin` to change status from `pending_approval` to `open` or `rejected`.

### 4. Moderation UI
Instead of a completely new page, we will:
- Add a "Moderation" tab to the `WorkWall` page, visible only to Council members and Admins.
- This tab will display tasks with `status = 'pending_approval'`.
- Each task card in this view will have "Approve" and "Reject" buttons.

## Risks / Trade-offs

- **[Risk] Bottleneck** → Council members might take time to approve. **Mitigation**: Notify council members via existing notification system when a new task is pending.
- **[Risk] UX Confusion** → Users might wonder why their task didn't appear. **Mitigation**: Show a "Pending Approval" badge/message to the creator after task creation.
