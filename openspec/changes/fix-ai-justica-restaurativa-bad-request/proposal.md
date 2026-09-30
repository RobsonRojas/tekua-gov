## Why

The frontend integration with the AI agent for Restorative Justice (`ai-justica-restaurativa`) is throwing a 400 Bad Request error when trying to send a chat message. The previous change fixed the 401 Unauthorized issue, but now the edge function is returning 400 Bad Request, indicating that there is a problem with the request payload or how the edge function processes it.

## What Changes

- Identify the cause of the 400 Bad Request in the `ai-justica-restaurativa` edge function.
- Fix the request processing logic (e.g., payload parsing or validation) to correctly handle incoming chat requests from the frontend.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None. (This is a bug fix in implementation details).

## Impact

- `supabase/functions/ai-justica-restaurativa/index.ts` (or similar edge function file) will be updated.
- Users will be able to successfully send messages to the Restorative Justice AI agent.
