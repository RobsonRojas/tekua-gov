# Proposal: Fix Reset Password Redirect

## Why
Currently, the application does not pass a `redirectTo` URL when calling `resetPasswordForEmail`. Because of this, Supabase redirects the user to the default site URL (the home page `/`) after verifying the email link, rather than the specific page where the user can enter their new password (`/reset-password`). This breaks the password recovery flow as the user never sees the reset password form.

## What Changes
- Add the `redirectTo` option to the `supabase.auth.resetPasswordForEmail` call in `src/pages/ForgotPassword.tsx`.
- The redirect URL will be dynamically built using `${window.location.origin}/reset-password` so it adapts automatically to localhost, staging, and production environments.
