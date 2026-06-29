## 1. Database Schema Updates

- [x] 1.1 Analyze the current `gift_economy_tasks` (or equivalent) table schema to identify how executors are currently stored.
- [x] 1.2 Create a database migration to add `executor_ids` (an array of UUIDs) or a `task_executors` join table.
- [x] 1.3 Update any existing RLS policies to allow read/write access based on the new multiple executors structure.

## 2. Backend & Edge Functions

- [x] 2.1 Update the `api-gifts` Edge Function (or equivalent backend logic) that handles task confirmation.
- [x] 2.2 Implement the reward calculation to divide `reward_amount` equally among all members listed in `executor_ids`.
- [x] 2.3 Ensure the ledger transfer logic handles multiple credits in a single transaction or loop to ensure consistency.

## 3. Frontend - Task Registration Form

- [x] 3.1 Locate the work registration form component (`/register-work`).
- [x] 3.2 Replace the single member selection input with an Autocomplete/multi-select component for executors.
- [x] 3.3 Update the form submission payload to send an array of selected UUIDs instead of a single string.

## 4. Frontend - Work Wall & Task Detail

- [x] 4.1 Update the `WorkWall` component to render multiple avatars for tasks that have multiple executors.
- [x] 4.2 Update the `TaskDetail` view to show the list of all participating executors and the split reward they each receive (or have received).
