## Why

The AI Agent (Oráculo) page consistently fails with a 401 Unauthorized error when calling the `ai-handler` Supabase Edge Function. The error message "Sessão expirada ou inválida" indicates the authentication token sent to the edge function is either missing, expired, or invalid. This breaks the entire AI chat experience for users, rendering the Oráculo page non-functional.

The root cause is in `src/lib/gemini.ts`: unlike `src/lib/api.ts` (which has session timeout handling and a fallback), the gemini client does not validate the session, attempt token refresh, or handle expired/missing tokens gracefully. When `supabase.auth.getSession()` returns a null or expired session, the request is sent with `Authorization: Bearer undefined`, which the edge function correctly rejects.

## What Changes

- Add session validation and token refresh logic in `src/lib/gemini.ts` before making requests to the edge function
- Throw a user-friendly error early when no valid session exists (instead of sending `Bearer undefined`)
- Add automatic token refresh attempt when the session is expired, using `supabase.auth.refreshSession()`
- Handle 401 responses from the edge function with a retry after refreshing the session (single retry)
- Show a contextual error message in the UI prompting the user to re-login when authentication definitively fails
- Apply the same fix pattern to `chatWithJRAgent` which has the identical vulnerability

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `ai-guidance`: Adding a requirement for session resilience — the AI agent must validate and refresh the user session before making API calls, and surface clear re-login prompts on auth failure.

## Impact

- **Frontend**: `src/lib/gemini.ts` — both `chatWithGemini` and `chatWithJRAgent` functions
- **Frontend**: `src/pages/AIAgent.tsx` — error display to guide users on auth failure
- **No backend changes**: The edge function `ai-handler/index.ts` auth logic is correct; the issue is entirely client-side
- **No breaking changes**: This is a bugfix; existing behavior is already broken
