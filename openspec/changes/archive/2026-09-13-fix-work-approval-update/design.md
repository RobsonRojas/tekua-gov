# Design: Fix Work Approval Update

## 1. Architecture
- **Frontend (`TaskDetail.tsx`):** Add error handling inside the `handleAction` block for `confirmActivity`. If an error occurs, set the `snackbarMessage` and `snackbarSeverity` to display the error, preventing silent failures.
- **Backend (Supabase):** The RPC or edge function handling `confirmActivity` (likely an RPC in `supabase/migrations/`) needs to be checked. It may be failing because the status is not exactly what it expects, or it might be trying to insert into a confirmations table and failing RLS policies.

## 2. API / Database Changes
- We may need to modify the `confirmActivity` RPC or its permissions if it's currently blocking the beneficiary from confirming their own task.

## 3. UI/UX Flow
- User clicks "Aprovar Trabalho".
- Loading spinner appears.
- If successful, progress bar updates to 100% and status changes to Completed.
- If failed, a red Snackbar displays the specific error message to the user.
