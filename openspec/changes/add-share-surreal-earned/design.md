## Context

The current wallet experience already shows a user balance, recent transactions, and a QR code for receiving Surreais. There is an existing task detail page with share actions, but the wallet does not currently support generating a public landing page for reward receipts.

## Goals / Non-Goals

**Goals:**
- Add a public landing page for received Surreais receipts.
- Provide a share action on the wallet receipt entry.
- Keep the share page lightweight and attractive for new members.
- Reuse existing public route patterns and avoid introducing unnecessary authentication requirements for visitors.

**Non-Goals:**
- Building a full social media sharing integration (Open Graph support can be added later).
- Reworking wallet accounting or Surreais issuance rules.
- Enabling authenticated write operations on the public landing page.

## Decisions

- Expose a public route under `/share/surreal/:shareId` or similar to keep share URLs separable from authenticated app routes.
- Use the existing wallet transaction model and add a shareable receipt record that references a received Surreais entry.
- The share link will be read-only and only display the received amount, recipient display name, and CTA.
- The call-to-action button will route to the public demands discovery or work wall path, depending on which public page is already available.

## Risks / Trade-offs

- [Risk] Public share links may expose a member's received amount.
  ? Mitigation: only expose aggregated data for a single shared receipt and not full wallet history.
- [Risk] The current app may not have an unauthenticated demands page to link to.
  ? Mitigation: use `/` or `/invite/task/...` fallback if no public discovery route is available.
- [Risk] Generating share links in the frontend alone may require secure server-side mapping.
  ? Mitigation: create a minimal backend handler or use a stable public entity id plus lightweight access control.
