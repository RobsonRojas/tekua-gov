## Context

See proposal.md - Why.
The edge function `ai-justica-restaurativa` uses `@supabase/supabase-js@2.38.4` and checks the session using `supabaseClient.auth.getUser()`. While the `Authorization` header is passed in the `global.headers` when initializing the client, explicitly passing the token to `getUser(jwt)` is more robust and prevents edge cases where the client might fail to extract the token from global headers. Also, the `api-wallet` function uses version `2.39.7`.

## Goals / Non-Goals

**Goals:**
- Fix the `401 Unauthorized` error by explicitly extracting the JWT from the `Authorization` header and passing it to `getUser(token)`.
- Update the `@supabase/supabase-js` version to match other edge functions (e.g., `2.39.7`) for consistency.

**Non-Goals:**
- No changes to the AI logic or system prompt.
- No changes to other edge functions.

## Decisions

- **Use `getUser(token)` instead of `getUser()`**: Supabase's `getUser()` method accepts a JWT directly. By extracting the token (`authHeader.replace('Bearer ', '')`) and passing it, we guarantee that the auth system validates the correct token sent by the client, regardless of internal `global.headers` processing.
- **Bump `@supabase/supabase-js` to `2.39.7`**: This aligns the dependency version with other working edge functions in the project (like `api-wallet` and `api-members`).

## Risks / Trade-offs

- [Risk] If the `Authorization` header does not contain `Bearer `, the replace method might result in an invalid token format.
  → Mitigation: We can use a regex or string manipulation that safely removes the `Bearer ` prefix.
