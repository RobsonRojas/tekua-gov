## 1. Backend Updates (Edge Functions & RPCs)

- [x] 1.1 Review and update the demand creation API/RPC to properly accept and store the `executor_ids` array instead of a single executor.
- [x] 1.2 Update the demand execution confirmation logic (e.g., in `api-work` or related edge function) to iterate over all users in the `executor_ids` array and execute the reward credit (surreais) for each.
- [x] 1.3 Ensure the notification and email dispatch logic iterates through the `executor_ids` array to send notifications to all assigned users upon demand creation and completion.

## 2. Frontend Updates (Work-Wall)

- [x] 2.1 Update the `CreateDemand` component to replace the single executor dropdown with the multi-select `Autocomplete` component used in work registration.
- [x] 2.2 Ensure the `CreateDemand` submission logic correctly formats the array of selected users as `executor_ids` for the backend.
- [x] 2.3 Verify that the demand view components (like `TaskDetail` and `ActivityCard`) correctly render the array of executors (this may already be supported from the previous `RegisterWork` changes, but requires verification for demands).
