## Context

The `Profile.tsx` component was partially updated to support an "admin view" mode via the `currentProfile` variable. However, several UI elements (Avatar, Typography labels for Name, Role, etc.) were still pointing to the `profile` object from the `useAuth` hook, which always represents the logged-in user.

## Goals / Non-Goals

**Goals:**
- Ensure all visual elements on the profile page use `currentProfile` instead of `profile`.
- Fix the logic that determines the displayed data when an admin is viewing another user's profile.

## Decisions

### Decision: Systematically replace `profile?.` with `currentProfile?.`
- **Rationale**: The `currentProfile` variable is already correctly calculated as `isAdminView ? targetProfile : profile`. Using it everywhere ensures consistency regardless of whether the user is viewing their own profile or an admin is viewing someone else's.

## Risks / Trade-offs

- **[Risk]** Missing an occurrence → **Mitigation**: Perform a careful manual review of `Profile.tsx` and run a build check.
