# Design: Fix Min Confirmations Display and Saving

## 1. Architecture
- **Backend Edge Function (`api-work`):** Modify the `fetchActivityDetail` SQL select string to ensure `min_confirmations` is part of the payload sent back to `TaskDetail.tsx`.
- **Frontend Component (`TaskDetail.tsx`):** Ensure that the component consumes `activity.min_confirmations` correctly and passes it to the edit modal upon re-opening, as well as to the progress bar.

## 2. API / Database Changes
- No schema changes are required. The column already exists and the update logic was added previously.
- We just need to fix the `SELECT` query in `supabase/functions/api-work/index.ts` to include `min_confirmations`.

## 3. UI/UX Flow
- User edits a task and changes "Número de Confirmações" from 1 to 5.
- Upon saving, the modal closes and the page re-fetches.
- The progress bar updates immediately to show `0 / 5 Confirmações` because the `min_confirmations` was successfully fetched.
