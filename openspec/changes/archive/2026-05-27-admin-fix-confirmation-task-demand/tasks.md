## 1. Backend Modifications

- [x] 1.1 Fix the `api-governance` Edge Function to ensure that `updateSettings` action correctly parses and stores the `validation_threshold` in the `governance_settings` table under the ID `current`.
- [x] 1.2 Update the `api-work` Edge Function (specifically the `createActivity` action) to fetch the `validation_threshold` from `governance_settings` and assign it to the new activity's `min_confirmations` field.

## 2. Frontend Modifications

- [x] 2.1 Update the `GovernanceServices.tsx` component (or the specific configuration form in the admin panel) to properly bind the `validation_threshold` input to the state, and ensure it is sent during the save operation.
- [x] 2.2 Verify that the `GovernanceServices.tsx` form correctly reads the initial `validation_threshold` on load so the UI reflects the true state of the database.

## 3. Testing

- [x] 3.1 Manually verify in the browser that updating the "Threshold de Validação" saves correctly and persists after a page reload.
- [x] 3.2 Manually create a new task (demand) and verify that the database row in `activities` has its `min_confirmations` equal to the newly set threshold.
