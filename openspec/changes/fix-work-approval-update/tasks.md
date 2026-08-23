# Tasks: Fix Work Approval Update

## 1. Frontend Error Handling
- [x] In `TaskDetail.tsx`, locate the `handleAction` function.
- [x] Modify the `try/catch` block to properly surface errors to the user using the existing Snackbar state (`setSnackbarMessage`, `setSnackbarSeverity`, `setSnackbarOpen`), especially when `apiClient.invoke('api-work', 'confirmActivity')` fails.

## 2. Backend RPC Verification
- [x] Locate the backend logic for `confirmActivity` (this might be in a Supabase edge function `api-work` or an RPC call).
- [x] Check why it's failing to register the confirmation (e.g., RLS, status checks, constraint violations).
- [x] Fix the backend function so it successfully records the confirmation and updates the activity status to `completed` if the threshold is met.
