## Why

The current `notify-engine` is hardcoded to use `alertas@tekua.org` as the sender address. The user has requested to change this to `gov@tekua.com.br`, which is likely the officially verified domain for the project's email delivery via Resend. Using the correct, verified email domain is essential for the emails to be accepted by Resend and delivered successfully without being blocked or marked as spam.

## What Changes

- Modify the `notify-engine` Edge Function to use `gov@tekua.com.br` as the "from" address for all email notifications.
- Update the sender name to remain "Tekuá Governança" or as appropriate, but the email address will strictly be `gov@tekua.com.br`.

## Capabilities

### New Capabilities
<!-- No new capabilities being introduced -->

### Modified Capabilities
- `event-notification-engine`: The sender address for dispatching email notifications is changing to `gov@tekua.com.br`.

## Impact

- `supabase/functions/notify-engine/index.ts`: Hardcoded email sender address will be updated.
- Email delivery will use the new domain, requiring `tekua.com.br` to be properly verified in the Resend dashboard.
