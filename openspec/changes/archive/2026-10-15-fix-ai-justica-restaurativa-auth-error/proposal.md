## Why

The frontend's integration with the AI agent for Restorative Justice (`ai-justica-restaurativa`) is currently failing with a `401 Unauthorized` error ("Erro: Sessão expirada ou inválida"). Looking at the backend logs, the user session appears valid (role: "authenticated", valid JWT), indicating an issue with how the Edge Function validates the session or handles authorization headers.

## What Changes

- Fix the authorization check in the `ai-justica-restaurativa` edge function so it correctly authenticates valid Supabase user sessions.
- Ensure the function handles preflight CORS requests (`OPTIONS`) correctly if the 401 is related to cross-origin issues or missing authorization headers in preflight.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None. (This is a bug fix in implementation details, not a change in business requirements).

## Impact

- `supabase/functions/ai-justica-restaurativa/index.ts` (or similar file) will be updated.
- Users will be able to talk to the Restorative Justice AI agent again.
