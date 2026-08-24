# Proposal: Edit Task Form Improvements

## The Problem
1. **Missing Translations**: The "Edit Task" modal is displaying translation keys (e.g., `work.editTaskTitle`, `work.executorHelper`, `common.save`) instead of the translated text in the supported languages.
2. **Editable Confirmations**: The edit form does not currently allow users to update the required number of confirmations (`min_confirmations`). 
3. **Default Confirmations**: When creating or editing tasks, the default minimum number of confirmations should be 1 instead of whatever is currently set.

## The Solution
- Add the missing translation keys to the respective `translation.json` files for all supported languages (PT, EN, etc.), or fix the mapping if the keys are incorrect.
- Add a new number input field to the Edit Task form to allow modifying `min_confirmations`.
- Ensure the default value for new tasks and the fallback for editing is `1` for the confirmations field.

## Key Features
- Properly translated UI in the edit modal.
- Users can adjust how many confirmations are required for an activity to be approved.
- Sensible defaults (1 confirmation) are applied to speed up the workflow.
