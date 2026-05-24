## 1. Fix TypeScript Errors

- [x] 1.1 In `src/lib/api.ts`, add `'api-public'` to the `ApiDomain` type union.
- [x] 1.2 In `src/pages/TaskInviteLanding.tsx`, remove the unused `t` variable from `const { t, i18n } = useTranslation()`.
- [x] 1.3 In `src/pages/TaskInviteLanding.tsx`, change `const { data, error }` to `const { error }` when calling `registerWithInviteToken`, as `data` is unused.
- [x] 1.4 In `src/pages/TaskInviteLanding.tsx`, add the missing import for `Grid`. Example: `import Grid from '@mui/material/Grid2';` (verify which version of Grid is being used by the component structure).

## 2. Verification

- [x] 2.1 Run `npm run build` locally to verify that all TypeScript compilation errors have been resolved.
