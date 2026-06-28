## Context

The system uses Supabase Auth for user registration. Currently, users are encountering an `HTTP 400: {"data":null,"error":"email rate limit exceeded"}` error when attempting to register. This indicates that the Supabase instance's rate limiting for the `auth.email` endpoint is being triggered. This can happen for several reasons:
1. The user clicks the submit button multiple times, sending multiple requests before the first one completes.
2. The frontend code has a bug causing duplicate submissions on a single click.
3. The Supabase project has an overly restrictive default rate limit for emails that needs to be increased for expected traffic.

## Goals / Non-Goals

**Goals:**
- Identify the root cause of the duplicate registration requests or rate limit triggers.
- Implement UI feedback (e.g., loading state, disabling the submit button) to prevent duplicate manual submissions.
- Ensure the application gracefully handles the rate limit error by showing a user-friendly message rather than an unhandled exception or cryptic JSON error, if the limit is legitimately hit.
- Investigate and potentially adjust the Supabase Auth rate limits if the current limits are too restrictive for normal operations.

**Non-Goals:**
- Completely overhauling the authentication system.
- Implementing a custom rate-limiting solution outside of Supabase.

## Decisions

1. **Frontend Button Disabling**: The primary mitigation will be to ensure the registration form's submit button is disabled and shows a loading indicator immediately upon the first click. This is a standard practice and often resolves 90% of these rate-limiting issues caused by impatient users.
2. **Error Handling**: The application must catch the specific `email rate limit exceeded` error from Supabase and translate it into a localized, user-friendly message (e.g., "Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.").
3. **Configuration Audit**: We will review the Supabase project configuration to ensure the email rate limit is set to a reasonable value for production use.

## Risks / Trade-offs

- **Risk**: Adjusting Supabase rate limits too high could make the system vulnerable to spam or enumeration attacks.
  - **Mitigation**: Only increase limits if they are unreasonably low (e.g., < 3 per hour per IP) and rely primarily on frontend UI fixes.
- **Risk**: Frontend disabling might not catch all cases (e.g., programmatic API access).
  - **Mitigation**: The backend (Supabase) rate limit remains the ultimate safeguard. Graceful error handling covers this gap.
