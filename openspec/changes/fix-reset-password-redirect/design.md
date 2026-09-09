# Design: Fix Reset Password Redirect

## Overview
The fix involves a minor modification to the authentication API call made in the `ForgotPassword` component. We simply need to ensure that the user is correctly routed back to the application's password reset route after Supabase validates the recovery token.

## Implementation Details

### `src/pages/ForgotPassword.tsx`
Modify the `handleResetRequest` function.
Update this line:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

To this:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

Using `window.location.origin` ensures that this works seamlessly across all environments without needing explicit environment variables for the frontend domain.
