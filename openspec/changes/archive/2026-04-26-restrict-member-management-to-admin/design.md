# Design - Restrict Member Management to Admin

## Context
Improve dashboard clarity for regular members.

## Decisions

### 1. Conditional Filtering
- In `src/pages/Home.tsx`, we will filter the `homeCards` array before rendering.
- Code update:
  ```tsx
  const visibleCards = homeCards.filter(card => !card.disabled || isAdmin);
  ```
  Wait, the current `homeCards` has `disabled: !isAdmin`. So if we only want to show it if `isAdmin` is true, we can check for that.
  Actually, the best way is to filter out cards where `path === '/admin/members'` if `!isAdmin`.
