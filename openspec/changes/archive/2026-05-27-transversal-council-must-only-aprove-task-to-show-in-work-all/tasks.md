## 1. Backend Modifications (`api-work`)

- [x] 1.1 In `supabase/functions/api-work/index.ts`, update the `fetchActivities` action to fetch the calling user's profile (`role`, `roles`).
- [x] 1.2 In `fetchActivities`, check if the user is an `admin` or a `transversal_council` member. If they are NOT, modify the Supabase query to exclude `pending_approval` and `rejected` tasks, UNLESS the task's `requester_id` matches the calling user's ID (so users can still see their own pending tasks).

## 2. Frontend Modifications (`WorkWall.tsx`)

- [x] 2.1 In `src/pages/WorkWall.tsx`, review the filtering logic to ensure that any local "Todos" tab filter is consistent with hiding `pending_approval` and `rejected` tasks for standard users.

## 3. Verification

- [x] 3.1 Verify that standard users cannot see pending tasks created by others in the Work Wall.
- [x] 3.2 Verify that Transversal Council members and Admins can see all pending tasks in the Work Wall for moderation.
