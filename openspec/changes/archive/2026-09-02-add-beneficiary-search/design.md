# Design: Add Search to Beneficiary Selection

## 1. Architecture
- **Frontend Component:** The component that renders the form (likely `NewWork.tsx`, `CreateTask.tsx`, or similar in `src/pages` or `src/components/work`) needs to be updated.
- We will import `<Autocomplete>` and `<TextField>` from `@mui/material`.
- We will map the fetched `profiles` to the Autocomplete's options format.

## 2. API / Database Changes
- No API or database changes are required. This is purely a UI enhancement.

## 3. UI/UX Flow
- User opens the create work/contribution form.
- The "Beneficiário" field now accepts text input.
- As the user types, the list of members filters down to match the input.
- User selects the correct member, and the underlying form state captures the `member.id`.
