## Why

Currently, the "Member Management" card is visible on the dashboard for all users, although it is disabled for non-admins. To improve security and user experience, access to user management should be strictly restricted to administrators, and the entry point should be hidden from members who cannot use it.

## What Changes

- **Dashboard Modification**: Remove the "Member Management" card from the dashboard (`Home.tsx`) for non-administrator users.
- **Strict Access Control**: Ensure that any attempt to access `/admin/members` or related admin routes is blocked for non-administrators, redirecting them to the dashboard.
- **UI Consistency**: Align the dashboard content with the user's role, showing only relevant and accessible actions.

## Capabilities

### Modified Capabilities
- `member-management`: Restrict UI entry points and enforce strict server-side/client-side access control for non-admins.
- `navigation-interface`: Update dashboard layout to conditionally render administrative cards based on user role.

## Impact

- `src/pages/Home.tsx`: Conditional rendering of the "Member Management" card.
- `src/components/ProtectedRoute.tsx` (if applicable) or Page-level checks: Reinforce route protection for admin-only pages.
- User Experience: Cleaner dashboard for regular members, focusing on their allowed activities.
