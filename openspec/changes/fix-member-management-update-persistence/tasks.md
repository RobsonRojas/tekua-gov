## 1. Backend: Edge Function Refactoring

- [ ] 1.1 Update `supabase/functions/api-members/index.ts` action `adminUpdateProfile` to allow updating the `role` field.
- [ ] 1.2 Ensure strict admin role validation before allowing role changes in `adminUpdateProfile`.

## 2. Frontend: Hook & Component Fixes

- [ ] 2.1 Refactor `src/hooks/useMembers.ts` to use `adminUpdateProfile` for all member edits, including role changes.
- [ ] 2.2 Clean up `src/components/admin/MemberEditModal.tsx` by removing the duplicate `Stack` import.
- [ ] 2.3 Verify that `onSave()` is called after a successful update and that it correctly triggers a list refresh.

## 3. Verification

- [ ] 3.1 Edit a member's name and role simultaneously in the Admin panel.
- [ ] 3.2 Verify that both changes are saved in the database.
- [ ] 3.3 Ensure the UI updates immediately after the modal closes.
