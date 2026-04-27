## Context

The Tekua Governance platform features a dashboard (Home) and a sidebar for navigation. Currently, administrative features like "Member Management" are visible to all users on the dashboard, even if they are disabled for non-admins. This design aims to hide these features completely for regular members to simplify the interface and reinforce the principle of least privilege.

## Goals / Non-Goals

**Goals:**
- Conditionally render dashboard cards based on the user's role.
- Ensure only admins see the "Member Management" card.
- Verify that route-level protection is sufficient to prevent manual URL access.

**Non-Goals:**
- Implementing a full RBAC (Role-Based Access Control) system (we will stick to the existing `member` vs `admin` roles).
- Changing the layout of the Member Management page itself.

## Decisions

### 1. Card Filtering in `Home.tsx`
- **Decision**: Instead of just passing a `disabled` property to the cards, we will filter the `homeCards` array based on the `isAdmin` flag before mapping it to components.
- **Rationale**: This completely removes the element from the DOM for non-admins, fulfilling the requirement of not having the card on the dashboard.
- **Alternative**: Keeping the card but changing its content (confusing).

### 2. Centralized Navigation Hook
- **Decision**: Continue using `useNavigation` to define `adminOnly` items for the sidebar, ensuring consistency between sidebar and dashboard where possible.
- **Rationale**: Reuses existing logic for the sidebar.

### 3. Route Protection
- **Decision**: Verify that the router or the page component (`AdminPanel.tsx` or similar) has a check for `isAdmin`.
- **Rationale**: Client-side filtering is for UX; actual security must be enforced at the route or component entry level.

## Risks / Trade-offs

- [Risk] Role data loading delay → [Mitigation] Use a loading state or default to "member" view until the profile is fully loaded to prevent UI flickering or accidental exposure.
- [Risk] Direct URL access → [Mitigation] Ensure `AdminPanel` and other sensitive pages have a redirect if `profile.role !== 'admin'`.
