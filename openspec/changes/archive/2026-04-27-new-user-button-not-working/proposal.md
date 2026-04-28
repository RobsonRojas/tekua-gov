## Why

The "Novo Membro" button in the User Management tab of the Admin Panel is currently non-functional. It lacks an `onClick` handler and the underlying backend capability to register or invite new members from the administrative interface is missing. This prevents administrators from managing the association's membership effectively.

## What Changes

- **Modified `supabase/functions/api-members/index.ts`**: Add an `inviteMember` action using the Supabase Admin API (`auth.admin.inviteUserByEmail`) to allow administrators to add new members.
- **Modified `src/hooks/useMembers.ts`**: Add a `createMember` function to invoke the new backend action.
- **New Component `src/components/admin/NewMemberModal.tsx`**: Implement a modal form to capture the new member's email and initial role.
- **Modified `src/pages/AdminPanel.tsx`**: 
    - Integrate the `NewMemberModal`.
    - Add an `onClick` handler to the "Novo Membro" button to open the modal.
    - Refresh the user list after a successful registration.

## Capabilities

### New Capabilities
- None (This is an extension of existing member management)

### Modified Capabilities
- `member-management`: Add requirement for administrative user creation/invitation flow.

## Impact

This change will enable administrators to proactively add new members to the platform. It involves both frontend UI work and backend edge function updates.
