## 1. Backend Implementation

- [x] 1.1 Add `inviteMember` action to `supabase/functions/api-members/index.ts` using `supabaseAdmin.auth.admin.inviteUserByEmail`.
- [x] 1.2 Ensure proper error handling and admin role verification in the new action.

## 2. Frontend Infrastructure

- [x] 2.1 Add `inviteMember` function to `src/hooks/useMembers.ts` to call the new edge function action.
- [x] 2.2 Export the new function from the hook for component usage.

## 3. UI Components

- [x] 3.1 Create `src/components/admin/NewMemberModal.tsx` with fields for email and role.
- [x] 3.2 Implement form validation (required email, valid format) in the modal.
- [x] 3.3 Add loading states and success/error feedback within the modal.

## 4. Integration

- [x] 4.1 Update `src/pages/AdminPanel.tsx` to manage the `NewMemberModal` visibility state.
- [x] 4.2 Connect the "Novo Membro" button `onClick` handler to open the modal.
- [x] 4.3 Trigger a user list refresh in `AdminPanel.tsx` upon successful member invitation.

## 5. Verification

- [x] 5.1 Verify that the modal opens correctly when "Novo Membro" is clicked.
- [x] 5.2 Test successful invitation flow and verify that the user appears in the list.
- [x] 5.3 Test error scenarios (e.g., inviting an existing user) and verify error messages.
