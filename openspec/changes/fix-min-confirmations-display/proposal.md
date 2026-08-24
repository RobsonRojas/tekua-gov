# Proposal: Fix Min Confirmations Display and Saving

## The Problem
After adding the `min_confirmations` field to the edit form, the updated value is not being reflected on the task details page after saving. This happens because the `min_confirmations` field is not being properly retrieved by the `fetchActivityDetail` endpoint in the backend, meaning the frontend never receives the updated value to render it.

## The Solution
Update the `fetchActivityDetail` function in the `api-work` Edge Function to explicitly select the `min_confirmations` column when returning activity data to the client. Additionally, verify that no row-level security (RLS) policies are blocking the update of this column.

## Key Features
- The "Número de Confirmações" field updates correctly and persists in the UI.
- The progress bar calculation (e.g., `0 / X Confirmações`) reflects the updated threshold correctly in real-time.
