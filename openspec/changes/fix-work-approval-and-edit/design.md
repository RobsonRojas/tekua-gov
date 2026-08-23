# Design: Fix Work Approval and Edit Button

## 1. Architecture
- **Frontend Component Updates:**
  - Update the header of the Work details page to properly use `useTranslation` or correct translation key mapping for `common.edit`.
  - Add logic to the Validation/Approval section (where the "0 / 1 Confirmações" is shown) to render an "Aprovar" button if `currentUser.id === work.beneficiary_id` and the work status allows approval.
- **Backend/API (if applicable):**
  - Ensure there is an RPC or mutation available to approve the work (e.g. `approveWork` or `validateWork`) if one does not already exist.

## 2. API / Database Changes
No schema changes expected. Only invoking existing mutation/RPC for work validation/approval if not already hooked up.

## 3. UI/UX Flow
1. User accesses the work page (e.g., `Contribuição Individual`).
2. If they have edit rights, the top right button shows "Editar".
3. If the user is the beneficiary, in the "Validação" section, they see a clear button "Aprovar Trabalho".
4. Clicking "Aprovar" updates the confirmation count to 1/1 and the status updates appropriately.

## 4. Error Handling
- Display error toast if the approval mutation fails.
- Disable the approve button during loading.
