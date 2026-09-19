## Why

The AI Handler Edge Function is failing with a `401 Unauthorized` / `AuthSessionMissingError`. This occurs because newer versions of the Supabase GoTrue client expect the JWT to be explicitly passed to `supabase.auth.getUser(jwt)` when running in edge functions without cookie/storage context. The current code relies on the global headers fallback, which fails to authenticate properly.

## What Changes

- Extract the JWT token from the `Authorization` header in the `ai-handler` edge function.
- Pass the extracted JWT directly to `supabaseClient.auth.getUser(jwt)` to correctly retrieve the authenticated user.

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
_(none)_

## Impact

- **Backend**: `supabase/functions/ai-handler/index.ts` — update how `getUser` is called.
- No frontend changes needed.
