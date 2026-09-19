## 1. Token Validation & Refresh Helper

- [x] 1.1 Add `getValidToken(forceRefresh?: boolean)` function to `src/lib/gemini.ts` that calls `supabase.auth.getSession()`, checks if the token exists and the JWT `exp` is still valid, and calls `supabase.auth.refreshSession()` when needed. Throws a typed error with message `'Sessão expirada ou inválida. Faça login novamente.'` when no valid token can be obtained.
- [x] 1.2 Add `isTokenExpired(token: string): boolean` helper that decodes the JWT payload (base64) and checks the `exp` claim against `Date.now()`, with a 30-second buffer to avoid edge-of-expiry failures.

## 2. Apply to chatWithGemini

- [x] 2.1 Replace the direct `supabase.auth.getSession()` call in `chatWithGemini` with `getValidToken()` to validate and refresh the token before the fetch.
- [x] 2.2 Add 401 retry logic: if `response.status === 401`, call `getValidToken(true)` (force refresh) and retry the fetch exactly once. If the retry also returns 401, throw the session-expired error.

## 3. Apply to chatWithJRAgent

- [x] 3.1 Replace the direct `supabase.auth.getSession()` call in `chatWithJRAgent` with `getValidToken()`.
- [x] 3.2 Add the same 401 retry logic as in `chatWithGemini`.

## 4. UI Error Handling

- [x] 4.1 In `src/pages/AIAgent.tsx`, detect the session-expired error message in the catch block and render a re-login prompt (link to `/login`) instead of the generic error display.
- [x] 4.2 Add i18n keys for the session-expired message in the translation files if they exist, or use a hardcoded bilingual fallback.

## 5. Verification

- [x] 5.1 Build the project (`npm run build`) to verify no TypeScript compilation errors.
- [x] 5.2 Manually verify: with a valid session, the AI agent sends messages successfully (no 401).
- [x] 5.3 Verify that the error message is user-friendly when auth truly fails (e.g., after clearing session storage).
