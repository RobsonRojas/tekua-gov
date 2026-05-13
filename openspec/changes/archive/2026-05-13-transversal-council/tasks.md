## 1. Database & Security

- [x] 1.1 Update `activities` table to support `pending_approval` and `rejected` statuses (check constraints or enums).
- [x] 1.2 Update Supabase Row Level Security (RLS) policies for the `activities` table to restrict visibility of `pending_approval` tasks to creators and council members.
- [x] 1.3 Add helper function or logic to check for the `transversal_council` role in RLS.

## 2. Core Logic

- [x] 2.1 Modify task creation service/hook to set the default status to `pending_approval`.
- [x] 2.2 Update profile management to support assigning the `transversal_council` role.

## 3. Frontend: Work Wall Moderation

- [x] 3.1 Update `WorkWall.tsx` to include a Moderation tab visible only to `transversal_council` and `admin` users.
- [x] 3.2 Implement a moderation view that lists all `pending_approval` activities.
- [x] 3.3 Add "Approve" and "Reject" buttons to activity cards in the moderation view.
- [x] 3.4 Update the main Work Wall view to filter out `pending_approval` tasks for regular users.

## 4. Frontend: Task Creation Feedback

- [x] 4.1 Update `CreateTask.tsx` and `CreateDemand.tsx` to show a notification or feedback indicating that the submission is pending approval.
- [x] 4.2 Add status badges to the "My Activities" view (if applicable) so creators know their task status.

## 5. Automated Testing

- [x] 5.1 Implement unit tests for task status transition logic (e.g., in `taskService.test.ts`).
- [x] 5.2 Implement integration tests using Playwright/Vitest Browser to verify the end-to-end approval flow.

## 6. Verification & Manual Testing

- [x] 6.1 Perform manual test: Create task as regular user → Verify it does not appear on public wall.
- [x] 6.2 Perform manual test: Login as council member → Approve task → Verify it appears on public wall.
- [x] 6.3 Perform manual test: Reject task → Verify it remains hidden.
