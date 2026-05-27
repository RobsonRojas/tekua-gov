## Why

The TypeScript build is failing with several errors in `src/pages/TaskInviteLanding.tsx` and related to the `ApiDomain` type. These errors prevent the project from successfully compiling and deploying.

## What Changes

- Fix unused variables (`t`, `data`) in `src/pages/TaskInviteLanding.tsx`.
- Add `'api-public'` to the `ApiDomain` type in `src/lib/api.ts` so that `apiClient.invoke` recognizes it as a valid endpoint.
- Add the missing `Grid` import in `src/pages/TaskInviteLanding.tsx`.

## Capabilities

### Modified Capabilities

- `invite-link-with-surreal-reward`: Ensure the UI component and API calls are fully typed and compilable.

## Impact

- **Build**: The `npm run build` command will complete successfully.
