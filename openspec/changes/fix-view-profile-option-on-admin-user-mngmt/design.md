## Context

The current user management system lists all members but lacks the ability to drill down into a specific member's details. The `Profile` page is hardcoded to display the currently authenticated user's profile from the `useAuth` context. To allow admins to view other profiles, we need to transition the `Profile` component to fetch data based on a URL parameter when present.

## Goals / Non-Goals

**Goals:**
- Enable parameterized routing for user profiles.
- Allow admins to view any profile by ID.
- Ensure regular users can only view their own profile (redirect if they attempt to access another ID).

**Non-Goals:**
- Allowing non-admins to view other users' profiles.
- Implementing profile editing for admins on other users' profiles (this can be a separate change if needed).

## Decisions

### Decision: Parameterized Route `/profile/:id?`
- **Rationale**: Using a single `Profile` component for both self-view and admin-view simplifies maintenance. The presence of the `:id` param triggers the "admin view" mode.
- **Alternatives considered**:
  - Separate `/admin/members/:id` page: Rejected to avoid duplicating the complex profile layout (tabs, activity history, etc.).

### Decision: Reuse `fetchUsers` or add `getProfileById` to `api-members`
- **Rationale**: `api-members` already has `fetchUsers` which returns full profile data if the requester is an admin. However, fetching a single user is more efficient. I will check if `getProfile` in `api-members` can be extended to accept an optional `targetUserId`.

## Risks / Trade-offs

- **[Risk]** Regular users accessing other profiles via URL manipulation → **Mitigation**: Add a check in `Profile.tsx` to verify that either `id === authUser.id` or `currentUser.role === 'admin'`. If neither, redirect to their own profile or show an error.
