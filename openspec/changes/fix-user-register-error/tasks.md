## 1. Diagnostics & UI Prevention

- [x] 1.1 Locate the user registration form component in the frontend codebase.
- [x] 1.2 Implement a state variable (e.g., `isSubmitting`) to track the submission status of the registration form.
- [x] 1.3 Disable the submit button and show a loading indicator while `isSubmitting` is true to prevent duplicate requests.

## 2. Error Handling & Feedback

- [x] 2.1 Update the registration error handling block to specifically check for the `email rate limit exceeded` error from Supabase.
- [x] 2.2 Translate the error into a localized, user-friendly message (e.g., "Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.").
- [x] 2.3 Display the localized error message appropriately in the UI.

## 3. Backend Verification

- [x] 3.1 Verify the current Supabase project's `auth.email` rate limit settings (via dashboard or CLI) to confirm if the limits are overly restrictive.
- [x] 3.2 Adjust the rate limit if deemed necessary for expected production traffic.
