## 1. Backend API Extension

- [x] 1.1 Update `supabase/functions/api-members/index.ts` to include the `removeMember` action.
- [x] 1.2 Implement the security check to ensure only admins can trigger the `removeMember` action.
- [x] 1.3 Use `supabaseAdmin.auth.admin.deleteUser(targetUserId)` to permanently remove the user from the authentication and profiles system.

## 2. Frontend UI Implementation

- [x] 2.1 Add state variables in `AdminPanel.tsx` to manage the visibility of a new confirmation dialog (`isDeleteDialogOpen`).
- [x] 2.2 Create a confirmation `Dialog` component within `AdminPanel.tsx` that clearly states the consequences of removing a member.
- [x] 2.3 Implement the `handleConfirmDelete` function which invokes `api-members` with the `removeMember` action.
- [x] 2.4 Update the "Remover Acesso" `MenuItem` to trigger the confirmation dialog instead of simply closing the menu.
- [x] 2.5 Add a safeguard in the UI to disable or hide the "Remover Acesso" option when the `selectedUser` is the current authenticated administrator.

## 3. Verification and Testing

- [x] 3.1 Manually verify the removal of a test member account.
- [x] 3.2 Confirm that the deleted user's record is removed from both the Supabase `auth.users` and the public `profiles` table.
- [x] 3.3 Verify that the user list refreshes automatically after a successful deletion.
- [x] 3.4 Ensure appropriate error handling and feedback messages are displayed if the API call fails.
