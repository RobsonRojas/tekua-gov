# Proposal - Restrict Member Management to Admin

## What
Hide the "Gerenciamento de Membros" card on the dashboard for users who do not have the 'admin' role.

## Why
Currently, the card is visible but disabled for non-admins. To simplify the UI and reduce clutter for regular members, it should be hidden entirely if they don't have permission to access it.

## How
1.  In `src/pages/Home.tsx`, filter the `homeCards` array based on the `isAdmin` boolean.
2.  Alternatively, use a conditional render when mapping over `homeCards`.

## What Changes
- `src/pages/Home.tsx`: Filter `homeCards` to exclude the Member Management card if `!isAdmin`.
