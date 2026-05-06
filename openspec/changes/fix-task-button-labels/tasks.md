## 1. Localization Fixes

- [x] 1.1 Add `approve` and `reject` translation keys to `src/locales/pt/translation.json`
- [x] 1.2 Add `approve` and `reject` translation keys to `src/locales/en/translation.json`

## 2. Backend Permission Fixes

- [x] 2.1 Update `moderateActivity` in `supabase/functions/api-work/index.ts` to use `roles` array check
- [x] 2.2 Update `fetchPendingPayouts` in `supabase/functions/api-work/index.ts` to use `roles` array check
- [x] 2.3 Update `auditPayout` in `supabase/functions/api-work/index.ts` to use `roles` array check
- [x] 2.4 (Optional) Verify other Edge Functions for similar role-check issues

## 3. Verification

- [ ] 3.1 Verify button labels in the UI
- [ ] 3.2 Verify that a "transversal_council" user can successfully approve/reject an activity
- [ ] 3.3 Verify that an "admin" user can still approve/reject activities
