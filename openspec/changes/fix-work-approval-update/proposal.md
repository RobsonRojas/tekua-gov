# Proposal: Fix Work Approval Update

## The Problem
When the beneficiary clicks the "Aprovar Trabalho" button on the Work Details page, the action does not seem to update the confirmation count ("0 / 1 Confirmações") or progress bar. The `confirmActivity` backend mutation might be failing, not returning the correct state, or the frontend `handleAction` might not be correctly catching and displaying errors if the mutation fails.

## The Solution
1. Investigate the `confirmActivity` RPC or Edge Function to ensure it correctly registers the confirmation for the given `activityId` and the user's `profileId`.
2. Update the frontend `handleAction` in `TaskDetail.tsx` to properly handle and display any errors returned by `apiClient.invoke('api-work', 'confirmActivity', ...)` so failures are visible to the user via a toast/snackbar.
3. Verify that `fetchDetail()` correctly pulls the updated `confirmations` list and `status` after the mutation succeeds.

## Key Features
- Proper error feedback when approving a task.
- Reliable UI updates (progress bar and confirmation counts) immediately after the beneficiary approves the work.
