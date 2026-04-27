## Why

Currently, when an administrator views a user's profile from the admin panel, the profile page incorrectly displays the administrator's own data instead of the selected user's data. This is due to an incomplete migration of the `profile` variable to `currentProfile` in the `Profile.tsx` component.

## What Changes

- Complete the replacement of the `profile` variable (which represents the authenticated user) with `currentProfile` (which represents the user being viewed) throughout `Profile.tsx`.
- Ensure all profile fields (Name, Role, Join Date, Avatar) reflect the user specified by the URL parameter when in "admin view" mode.

## Capabilities

### Modified Capabilities
- `user-profile`: Ensure the profile view accurately reflects the target user's data when accessed by an admin.

## Impact

- **Affected Components**: `src/pages/Profile.tsx`.
