## Context

Currently, the `api-members` edge function uses `supabaseAdmin.auth.admin.inviteUserByEmail` to invite new users. When the SMTP configuration fails (e.g., rate limits or wrong credentials), GoTrue (Supabase Auth) throws an `AuthApiError: Error sending invite email` and rolls back the user creation transaction.
Our edge function catches this error, logs it, inserts a record into the `email_queue`, and returns a 200 OK status to the frontend.
Because the frontend receives 200 OK, it shows "user registration successful". However, since GoTrue rolled back the transaction, the user does not exist in `auth.users` and the trigger to create the `profiles` record never runs. Consequently, the user does not appear in the member list.

## Goals / Non-Goals

**Goals:**
- Ensure the user is actually created in `auth.users` and `profiles` even if the SMTP configuration is broken or unavailable.
- Continue queuing the email in `email_queue` if we can't send it synchronously, or delegate all email sending to our own queue/worker if desired.

**Non-Goals:**
- Fix the SMTP server itself (that's an infrastructure task).
- Change the frontend UI.

## Decisions

**Decision 1: Use `admin.createUser` instead of `inviteUserByEmail`**
Instead of relying on GoTrue's invite function which couples user creation with email sending, we will:
1. Create the user using `admin.createUser({ email, email_confirm: true, user_metadata: {...}, password: <random> })`. This explicitly creates the user without sending an invite email.
2. Generate an invite link using `admin.generateLink({ type: 'invite', email, options: { data: user_metadata } })` or just queue the invite intent. Actually, if we use `admin.createUser`, we can generate a password recovery link or invite link and put it in the `email_queue` for our own worker to send. Wait, `admin.createUser` doesn't send an email if `email_confirm` is true (or rather, we shouldn't send it). Alternatively, we can just let `admin.inviteUserByEmail` be called, and if we want to bypass SMTP issues, we might just have to fix SMTP. But the user explicitly added `email_queue` for this.
So we will use `admin.createUser` + `email_queue` to ensure the user is created.

**Alternatives Considered:**
- Just return a 500 error to the frontend if `inviteUserByEmail` fails. This would correctly show an error to the user, but the user specifically added `email_queue` to handle offline/failing emails.
- Call `inviteUserByEmail` and if it fails, fallback to `createUser`.

## Risks / Trade-offs

- [Risk] Generating a random password might be needed for `createUser`. → Mitigation: We will use a secure random password generator.
- [Risk] We have to manually send the invite email using the queue. → Mitigation: The system already has an `email_queue` table for this purpose.
