## 1. Frontend: UI Components

- [x] 1.1 Update `src/components/admin/MemberEditModal.tsx` to include the "Membro do Conselho Transversal" toggle.
- [x] 1.2 Implement logic in `MemberEditModal.tsx` to synchronize the toggle state with the `roles` array.
- [x] 1.3 Update `src/pages/MemberManagement.tsx` to ensure the "Conselho" role chip is correctly styled and displayed.

## 2. Localization and Types

- [x] 2.1 Verify and update `src/locales/pt/translation.json` with the necessary keys (e.g., `profile.isTransversalCouncil`).
- [x] 2.2 Update `src/utils/memberUtils.ts` with helper functions for transversal council member check if necessary.

## 3. Verification

- [ ] 3.1 Manually verify that an administrator can toggle a member as a council member and the change persists.
- [ ] 3.2 Verify that the "Conselho" label appears in the member list after assignment.
