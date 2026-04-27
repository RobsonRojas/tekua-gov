## Why

The "View Profile" option in the Admin Panel's user management list is currently non-functional. Clicking it only closes the action menu without navigating to the user's profile. Admins need to be able to view and verify member profiles to ensure data accuracy and governance compliance.

## What Changes

- Enable navigation from the Admin Panel to a specific user's profile.
- Update the `/profile` route to support an optional user ID parameter (`/profile/:id?`).
- Update the `Profile` page to fetch and display another user's data when an ID is provided (if the requester has admin permissions).
- Implement the `onClick` handler for the "View Profile" menu item in `AdminPanel.tsx`.

## Capabilities

### Modified Capabilities
- `member-management`: Allow admins to navigate to and view individual member profiles.
- `user-profile`: Extend the profile view to support viewing other users' data by ID (admin-only).

## Impact

- **Affected Components**:
  - `AdminPanel.tsx` (User management actions)
  - `Profile.tsx` (Data fetching and display logic)
  - `router.tsx` (Route definition)
- **APIs**: Potentially uses existing `api-members` methods to fetch specific profile data.
