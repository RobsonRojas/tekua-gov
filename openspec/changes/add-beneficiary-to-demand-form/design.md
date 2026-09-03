# Design: Beneficiary Selection in Demand Form

## Architecture
- **Component**: Update `WorkForm` (or the equivalent demand form component) to include a new input for the Beneficiary.
- **State Management**: Add `beneficiary_id` (or similar depending on DB schema) to the form state.
- **Data Fetching**: Fetch the list of available beneficiaries (e.g., users, projects, or specific entity type) to populate the dropdown.
- **API integration**: Ensure the `api-work` or demand submission endpoint accepts and processes the new `beneficiary_id` field.

## UI/UX
- Place the "Beneficiário" field alongside similar relation fields (e.g., Project, Executor).
- Use an autocomplete or standard `<Select>` depending on the expected number of options (reusing the logic proposed in `add-beneficiary-search` if applicable).
