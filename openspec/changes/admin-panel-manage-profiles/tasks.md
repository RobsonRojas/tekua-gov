## 1. Database and Schema

- [ ] 1.1 Create Supabase migration to add `is_board_member` (BOOLEAN, default FALSE) and `board_role` (TEXT, nullable) to the `profiles` table.
- [ ] 1.2 Update the `handle_new_user` function to include new fields if necessary (defaults should handle it).

## 2. Backend Security (Edge Functions)

- [ ] 2.1 Update `supabase/functions/api-members/index.ts` to include `is_board_member` and `board_role` in `protectedFields` for the `updateProfile` action (preventing self-promotion).

## 3. Constants and Helpers

- [ ] 3.1 Create `src/constants/boardRoles.ts` with the list of roles for philosophical societies (Presidente, Tesoureiro, etc.).
- [ ] 3.2 Create a utility to check if a user is a board member based on their profile data.

## 4. Admin Panel UI

- [ ] 4.1 Update `src/components/admin/MemberEditModal.tsx` to add a Switch for "Membro da Diretoria" and a Select for the functional role.
- [ ] 4.2 Update the member table in `src/pages/AdminPanel.tsx` (or the relevant component) to display board status/role badges.
- [ ] 4.3 Update `src/components/admin/NewMemberModal.tsx` to optionally allow setting board roles during invitation.

## 5. User Profile UI

- [ ] 5.1 Update the Profile page (`src/pages/Profile.tsx` or similar) to display the user's board position if they are a board member.
- [ ] 5.2 Add necessary translations to `src/locales/pt/common.json` (or equivalent) for new labels.

## 6. Verification

- [ ] 6.1 Verify that an admin can toggle board membership and change roles.
- [ ] 6.2 Verify that a non-admin member cannot change their own board status via the profile page.
- [ ] 6.3 Verify that board roles are correctly displayed in the member directory.
