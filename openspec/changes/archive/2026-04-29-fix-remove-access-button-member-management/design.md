## Context

The member management system is missing the "Delete" functionality. While the UI menu exists, it is not wired to any logic. The backend requires a new administrative action to interface with Supabase Auth's administrative delete capabilities.

## Goals / Non-Goals

**Goals:**
- Provide administrators with the ability to remove users from the platform.
- Ensure the removal process is safe and requires explicit confirmation.
- Guarantee that user data is removed from both the application profiles and the authentication provider.

**Non-Goals:**
- Soft-deletion (deactivation without removal). We are implementing full account removal as requested by the "Remove Access" context.
- Bulk deletion of users.

## Decisions

### 1. Administrative Delete Action
A new action `removeMember` will be added to the `api-members` Edge Function.
- **Security**: The function will use the `service_role` client (`supabaseAdmin`) to perform the deletion, as regular users cannot delete other users. It will first verify that the requester is an administrator.
- **Execution**: It will call `supabaseAdmin.auth.admin.deleteUser(targetUserId)`. Due to the database schema configuration where `profiles.id` references `auth.users(id) ON DELETE CASCADE`, the profile record will be automatically cleaned up.

### 2. UI Confirmation Flow
Instead of an immediate action, `AdminPanel.tsx` will trigger a confirmation dialog.
- **Component**: We will use a standard MUI `Dialog` to show the confirmation.
- **Safety**: The "Confirm" button will be styled with an error color (red) to signify a destructive action.
- **Self-Protection**: The frontend will check if `selectedUser.id === currentUserId` and disable/hide the removal option for the active administrator.

## Risks / Trade-offs

- **[Risk] Accidental Deletion** → **[Mitigation]** The mandatory confirmation dialog and high-visibility (red) UI elements will minimize this risk.
- **[Trade-off] Account Recovery** → Removing a user from Auth is permanent. We accept this trade-off as "Remove Access" in this context usually implies a final revocation of membership.
