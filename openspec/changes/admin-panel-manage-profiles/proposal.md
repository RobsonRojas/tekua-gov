## Why

The current system only distinguishes between basic user roles (Admin and Member). As the village (vila) governance structure evolves, there is a need to distinguish between common members and board members (diretoria), and to assign specific functional roles (e.g., President, Treasurer) to ensure clear accountability and proper representation within the platform.

## What Changes

- **Board Role Definition**: Introduce a clear distinction between common members and board members.
- **Functional Role Assignment**: Allow administrators to assign specific roles like President, Treasurer, Vice-President, Secretary, and other roles typical of philosophical societies to members.
- **Enhanced Member Profiles**: Update member profiles to display their board status and specific functional roles.
- **Admin Management Interface**: Update the administration panel to manage these new roles and statuses efficiently.

## Capabilities

### New Capabilities
- `board-roles-management`: Management of specific board roles (President, Treasurer, etc.) and board membership status.

### Modified Capabilities
- `member-management`: Extend user management to support the assignment of board roles and display status in the member list.
- `user-profile`: Update user profiles to include and display board-related information.

## Impact

- **Database**: New tables or columns to store board membership and functional roles.
- **API/Supabase**: RPCs or policies to handle role assignment and retrieval.
- **Frontend**: New UI components in the Admin Panel for role management and updates to profile views.
- **Governance**: Alignment with legal/statutory requirements for philosophical society management.
