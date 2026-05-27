## Context
Currently, the `ResetPassword.tsx` component parses `?e=` (email) and `?t=` (token_hash) from the URL and calls `supabase.auth.verifyOtp({ email, token_hash, type: 'recovery' })`. 
However, Supabase's `verifyOtp` function now enforces that when `token_hash` is used, the `email` field must NOT be provided. Passing both fields throws the error `AuthApiError: Only the token_hash and type should be provided`, blocking users from recovering their passwords.

## Goals / Non-Goals

**Goals:**
- Fix the 400 error in the password reset flow.
- Ensure the token hash is successfully verified using the Supabase SDK.

**Non-Goals:**
- Modifying other authentication or recovery flows (e.g., OTP-based flows).

## Decisions
- **Remove `email` from `verifyOtp` payload**: We will extract `?e=` if needed for logging or user display, but we will exclude it from the `supabase.auth.verifyOtp` arguments to comply with Supabase's PKCE/email-link validation requirement for `token_hash`.

## Risks / Trade-offs
- **Risk**: Minimal. This aligns the frontend call with the backend SDK expectation and prevents the error.
