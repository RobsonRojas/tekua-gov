## Context

The current implementation of member updates in the admin panel is fragmented. The `api-members` Edge Function distinguishes between `manageAdmin` (for role updates) and `adminUpdateProfile` (for other profile fields). When the frontend sends an update containing both, the `useMembers` hook chooses one over the other, leading to data loss (specifically, name changes being ignored when a role is also changed).

## Goals / Non-Goals

**Goals:**
- Ensure all profile fields updated by an admin are correctly persisted.
- Unify the update logic in the `useMembers` hook.
- Fix UI bugs in the `MemberEditModal` (double imports).

**Non-Goals:**
- Adding new fields to the user profile.
- Changing the authorization model for member management.

## Decisions

### 1. Unified Update Action in Edge Function
- **Decision**: Update the `manageAdmin` action in `api-members` to accept an optional `updates` object containing other profile fields, OR update `adminUpdateProfile` to also handle `role` changes if the requester is an admin.
- **Decision (Final)**: We will update `adminUpdateProfile` to allow updating the `role` field when called via the admin client, as this is the most flexible approach.

### 2. Frontend Hook Refactoring
- **Decision**: Simplify `useMembers.ts` to use a single API call for all admin-initiated member updates.

### 3. Component Cleanup
- **Decision**: Remove duplicate `Stack` import and ensure `onSave` (which triggers `refreshMembers`) is called correctly.

## Risks / Trade-offs

- **Risk**: Security regression if `role` can be updated via a non-admin endpoint.
  - **Mitigation**: Strict admin check in the Edge Function using the `profiles` table role before allowing any `role` field modifications.
