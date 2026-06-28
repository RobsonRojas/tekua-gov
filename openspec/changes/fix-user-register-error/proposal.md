## Why

When users attempt to register, they are encountering an `HTTP 400: {"data":null,"error":"email rate limit exceeded"}` error. This blocks new user registration, preventing users from accessing the platform. This is a critical issue that needs immediate resolution as it directly impacts user acquisition.

## What Changes

- Modify Supabase authentication rate limits if possible in configuration, or
- Implement logic in the application to handle and display rate limit errors gracefully, preventing multiple rapid submissions.
- Investigate if multiple requests are being sent by the frontend unintentionally.

## Capabilities

### New Capabilities
- `rate-limit-handling`: Handling of API rate limits, specifically for authentication endpoints.

### Modified Capabilities
- `user-auth`: Modifications to the registration flow to ensure single request submission and proper error feedback.

## Impact

- Frontend: Registration component/form.
- User experience: Improved error messaging instead of unhandled errors, or successful registration if frontend double-submission is fixed.
- Backend: Potential Supabase configuration changes for `auth.email` rate limits.
