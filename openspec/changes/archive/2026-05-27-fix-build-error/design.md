## Context

The `npm run build` process is failing due to strict TypeScript checks. Unused variables (`t`, `data`) and an untyped API domain (`'api-public'`) are causing the build to halt. Additionally, the `Grid` component from `@mui/material` (or `@mui/material/Grid2`) is missing its import in `TaskInviteLanding.tsx`.

## Goals / Non-Goals

**Goals:**
- Fix all TypeScript errors reported in the recent build attempt.
- Ensure `ApiDomain` type accurately reflects available edge functions.

**Non-Goals:**
- Refactoring `TaskInviteLanding.tsx` beyond fixing the compilation errors.

## Decisions

- **Unused Variables:**
  - In `TaskInviteLanding.tsx`, we will remove `t` from the destructuring of `useTranslation()` if it's not needed, or add an `eslint-disable-next-line` if it is a false positive. We'll simply remove it if unused.
  - We will rename `data` to `_data` or remove it if we only care about `error` from the `registerWithInviteToken` API call.
- **Type Issue:**
  - Open `src/lib/api.ts` and add `'api-public'` to the union type `ApiDomain`.
- **Missing Import:**
  - Add `import Grid from '@mui/material/Grid2';` or `import Grid from '@mui/material/Grid';` depending on which version is being used (since the usage is `<Grid size={{...}}>`, it implies `Grid2` is being used, often imported as `import Grid from '@mui/material/Grid2';` in MUI v6). We'll inspect the file and add the correct import.
