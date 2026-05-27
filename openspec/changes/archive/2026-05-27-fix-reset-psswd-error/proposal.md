## Why

The password reset page is failing to validate the recovery token because `supabase.auth.verifyOtp` is rejecting the request with the error: `AuthApiError: Only the token_hash and type should be provided`. This occurs because we are unnecessarily passing the `email` parameter along with the `token_hash` when verifying the recovery link, which is not supported by the current Supabase SDK for email link verifications.

## What Changes

- Remove the `email` property from the `supabase.auth.verifyOtp` call in `src/pages/ResetPassword.tsx`.
- Continue to parse `?e=` for any other contextual needs if necessary, but exclude it from the `verifyOtp` payload when using `token_hash`.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `forgot-password`: Update the requirement/design for verifying the OTP to reflect that only `token_hash` and `type` should be passed to the Supabase client.

## Impact

- **Frontend**: Only affects `src/pages/ResetPassword.tsx`.
- **User Experience**: Fixes the broken password reset flow and allows users to successfully set a new password.
