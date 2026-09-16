# Tasks: Fix Work Approval and Edit Button

## 1. Fix Edit Button Translation and Visibility
- [x] Locate the Work details page component (likely in `src/pages/Processos/` or `src/pages/Work/` or similar).
- [x] Locate the edit button in the header that displays `common.edit`.
- [x] Implement the `useTranslation` hook (or equivalent) to translate the key.
- [x] Verify the conditional rendering of the edit button to ensure it only shows for users with appropriate permissions (creator, executor, or admin).

## 2. Add Beneficiary Approval Button
- [x] In the same component, locate the "Validação" section.
- [x] Add a conditional check: `if (currentUser.id === work.beneficiary_id)`.
- [x] Render a button "Aprovar Trabalho" inside this section if the condition is met and the work is pending approval.
- [x] Wire the button to the corresponding Supabase function/mutation to approve/validate the work.
- [x] Handle loading state and display a success/error toast on completion.
