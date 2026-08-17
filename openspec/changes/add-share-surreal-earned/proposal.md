## Why

Members need a simple way to celebrate and share the Surreais they receive while inviting others to use the platform. Sharing a public receipt page makes the earning experience visible, attractive to newcomers, and connects the celebration directly to demands and work opportunities.

## What Changes

- Add a shared receipt experience for incoming Surreais that the recipient can publish or copy as a social share.
- Add a public share landing page that displays the received Surreais amount, a motivating message, and a call-to-action to explore demands and tasks.
- Extend wallet behavior to include a received Surreais extract and a share action for incoming receipt entries.

## Capabilities

### New Capabilities
- `surreal-share-landing`: Public shareable landing pages for received Surreais that promote earning new Surreais through demands and work.

### Modified Capabilities
- `wallet-system`: Add explicit received Surreais history and enable recipients to create/share a public receipt link for incoming rewards.

## Impact

- Affects wallet UI and shared link behavior in `src/pages/Wallet.tsx`, plus new public share page routing.
- Requires backend support for generating and resolving secure public share links from received Surreais records.
- Touches the wallet API and potentially `api-public` or edge function routing for unauthenticated shared content.
- Adds localized share copy and a new call-to-action for demands/tasks discovery.
