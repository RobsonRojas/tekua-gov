## 1. Dashboard UI Cleanup

- [ ] 1.1 Update `src/pages/Home.tsx` to filter the `homeCards` array based on the `isAdmin` flag.
- [ ] 1.2 Remove the `disabled` property from card definitions since administrative cards will now be hidden for non-admins.

## 2. Route and Access Protection

- [ ] 2.1 Verify that `src/pages/AdminPanel.tsx` (or the corresponding admin route component) correctly checks for the `admin` role and redirects non-admins.
- [ ] 2.2 Add unit tests for `Home.tsx` to ensure cards are rendered conditionally based on the user profile role.

## 3. Verification

- [ ] 3.1 Manually verify with a 'member' role that the Member Management card is not visible.
- [ ] 3.2 Manually verify with an 'admin' role that all administrative cards are still visible and functional.
- [ ] 3.3 Run existing E2E tests to ensure no regressions in navigation or auth.
