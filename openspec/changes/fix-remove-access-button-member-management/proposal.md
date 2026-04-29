## Why

The "Remove Access" button in the administrative member management panel is currently non-functional; it merely closes the action menu without executing any backend operations. Administrators need the ability to revoke access and remove users from the platform to maintain security and organizational integrity.

## What Changes

- **API Enhancement**: Implement a `removeMember` action in the `api-members` Edge Function. This action will:
    - Verify administrative privileges.
    - Delete the target user's profile from the `profiles` table.
    - Delete the target user's authentication account using the Supabase Admin API.
- **Frontend Bug Fix**:
    - Implement the `handleRemoveMember` logic in `AdminPanel.tsx`.
    - Introduce a confirmation dialog to ensure administrators don't accidentally remove members.
    - Connect the "Remover Acesso" menu item to the new functionality.
    - Ensure the user list is refreshed upon successful removal.

## Capabilities

### Modified Capabilities
- `member-management`: Extend the existing member management capability to include secure user removal.

## Impact

- **Backend**: Updated `api-members` Edge Function with administrative delete capabilities.
- **Frontend**: Modified `AdminPanel.tsx` to handle the removal flow and user feedback.
- **Security**: Ensures that account revocation is properly propagated to both database profiles and authentication layers.
