# Tasks - Restrict Member Management to Admin

- [ ] **1. UI Logic Update**
    - [ ] 1.1 In `src/pages/Home.tsx`, use the `isAdmin` constant to filter the `homeCards` array.
    - [ ] 1.2 Replace the `.map` on `homeCards` with a `.filter().map()` or conditionally return null for the restricted card.

- [ ] **2. Verification**
    - [ ] 2.1 Log in as a non-admin and verify the card is hidden.
    - [ ] 2.2 Log in as an admin and verify the card is visible.
