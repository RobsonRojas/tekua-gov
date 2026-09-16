# Tasks: Fix Min Confirmations Display and Saving

## 1. Update Backend Fetch Logic
- [x] Locate the `fetchActivityDetail` switch case in `supabase/functions/api-work/index.ts`.
- [x] Add `min_confirmations` to the string of columns requested in the `.select()` query.

## 2. Verify Frontend Display
- [x] Open `src/pages/TaskDetail.tsx`.
- [x] Ensure the value `activity.min_confirmations` is correctly used in the display logic (e.g., the `threshold` variable). (It is already using `activity.min_confirmations || 3`, so once it arrives from the backend it should work perfectly).
