## 1. Discovery and routing

- [ ] 1.1 Confirm the public route for shareable content and add a new `/share/surreal/:shareId` route if needed.
- [ ] 1.2 Add a reusable landing page component or route for the shared Surreais receipt.
 - [x] 1.1 Confirm the public route for shareable content and add a new `/share/surreal/:shareId` route if needed.
 - [x] 1.2 Add a reusable landing page component or route for the shared Surreais receipt.

## 2. Wallet share support

 - [x] 2.1 Add a share action for received Surreais entries in the wallet transaction history.
 - [x] 2.2 Implement share link generation and copying behavior in the wallet UI.
 - [x] 2.3 Ensure receipt entries can surface the amount received and recipient display name as share metadata.

## 3. Backend/public data support

 - [x] 3.1 Create or extend a public API route to resolve `/share/surreal/:shareId` and return the shared receipt data.
 - [x] 3.2 Add server-side validation for invalid or expired share links.

## 4. UX and CTA

 - [x] 4.1 Design the shared landing page with a motivating headline, amount display, and an "Explore demands" CTA.
 - [x] 4.2 Provide friendly fallback messaging if the share link is invalid.

## 5. Testing and validation

 - [x] 5.1 Add a test covering the copy/share action from the wallet receipt entry.
 - [x] 5.2 Add an integration or component test for the shared landing page rendering.
 - [x] 5.3 Validate the new route and public data response for invalid share IDs.
