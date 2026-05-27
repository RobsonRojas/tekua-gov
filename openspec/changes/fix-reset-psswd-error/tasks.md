## 1. Frontend Implementation

- [x] 1.1 In `src/pages/ResetPassword.tsx`, locate the `supabase.auth.verifyOtp` call within the `validateToken` useEffect.
- [x] 1.2 Remove the `email: emailParam` property from the object passed to `verifyOtp` so that only `token_hash` and `type` are sent.
- [x] 1.3 Verify that the typescript types are satisfied and there are no linting errors.

## 2. Verification

- [x] 2.1 Ensure the build succeeds by running a static type check or linting.
- [x] 2.2 Verify that a password reset request correctly parses the token hash and successfully opens the reset form without throwing the `AuthApiError: Only the token_hash and type should be provided` error.
