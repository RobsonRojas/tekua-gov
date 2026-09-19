## Context

See proposal.md for motivation. The current `src/lib/gemini.ts` calls `supabase.auth.getSession()` and uses the token directly without checking if the session is valid. When the session expires (JWT typically has a 1h lifetime in Supabase), the token is `undefined` and the edge function returns 401. The `src/lib/api.ts` already implements a timeout-based session fetch pattern but lacks retry logic, so we draw from both patterns to build a robust solution.

## Goals / Non-Goals

**Goals:**
- Fix the 401 error by validating the token before sending AI requests
- Add automatic session refresh when the token is expired
- Add a single retry with a refreshed token on 401 response
- Surface a clear, actionable error message to users when auth fails definitively
- Apply the fix consistently to both `chatWithGemini` and `chatWithJRAgent`

**Non-Goals:**
- Refactoring `api.ts` to use the same pattern (separate change)
- Implementing persistent reconnection or automatic re-login flows
- Changing the edge function auth logic (it's correct as-is)
- Adding offline/queue support for AI messages

## Decisions

### 1. Extract a shared `getValidToken()` helper

**Decision**: Create a `getValidToken()` function in `gemini.ts` that encapsulates session validation and refresh logic.

**Rationale**: Both `chatWithGemini` and `chatWithJRAgent` need the same token logic. A shared helper avoids duplication. Keeping it in `gemini.ts` avoids changing the module boundary since `api.ts` has its own pattern.

**Alternatives considered**:
- Moving to a shared `auth-utils.ts` module — considered overkill for now; would require refactoring `api.ts` too
- Using Supabase's `onAuthStateChange` listener globally — more complex, doesn't solve the per-request validation need

### 2. Refresh strategy: `getSession()` first, then `refreshSession()` on failure

**Decision**: First try `getSession()`. If the token is missing or the JWT `exp` is past, call `supabase.auth.refreshSession()` to get a new token. If refresh also fails, throw a typed `AuthError`.

**Rationale**: `getSession()` is cheap (reads from local storage). Only calling `refreshSession()` when needed avoids unnecessary network round-trips. Checking `exp` on the JWT lets us detect expiry before the edge function rejects us.

### 3. Single retry on 401 from edge function

**Decision**: If the fetch returns 401, call `getValidToken(forceRefresh: true)` and retry the request exactly once. If the retry also returns 401, surface the error.

**Rationale**: There's a race condition where the session might expire between the token check and the edge function call. A single retry handles this without creating infinite loops.

### 4. Error messaging via throw with typed error

**Decision**: Throw an error with a specific message key (`'auth.sessionExpired'`) that `AIAgent.tsx` can detect and display as a re-login prompt instead of a generic error.

**Rationale**: The UI already catches errors from `chatWithGemini` and displays `err.message`. By using a recognizable message, we can show a contextual "Faça login novamente" message with a link to the login page.

## Risks / Trade-offs

- **Race condition during refresh**: Two concurrent requests could both trigger a refresh. `supabase-js` internally deduplicates refresh calls, so this is safe.
- **Token expiry check**: We parse the JWT locally to check `exp`. If the server clock is significantly off from the client, the check could be wrong. The retry on 401 mitigates this.
- **UX during refresh**: The user may see a very brief delay (one extra network call) when the session needs refreshing. This is acceptable since it prevents a full error.
