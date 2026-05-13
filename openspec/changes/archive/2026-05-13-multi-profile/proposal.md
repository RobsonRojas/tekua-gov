## Why

Currently, members are limited to a single primary role and a single board position. In a real-world organizational structure, members often hold multiple functions simultaneously (e.g., an Admin who also performs tasks as a Member, or a President who is also a Director and a Council Member). This change enables members to have multiple concurrent roles and profiles, providing the necessary flexibility for complex governance structures.

## What Changes

- **BREAKING**: Migration of the `role` field in the `profiles` table from a single value to a collection (e.g., JSONB array or many-to-many table).
- **BREAKING**: Consolidation of `is_board_member` and `board_role` into the new unified multi-profile system.
- Update to Supabase RLS policies and RPC functions to support multi-role checks.
- Update to the `MemberManagement` interface to allow assigning multiple roles to a single member.
- Update to the `Profile` page and header components to display multiple active roles.
- Update to `useAuth` and `useMembers` hooks to handle the new multi-role data structure.

## Capabilities

### New Capabilities
- `multi-profile-management`: Core system for defining, assigning, and checking multiple roles and functions for members.

### Modified Capabilities
- `auth`: Update profile retrieval and session state to include the array of roles.
- `user-profile`: Update profile display and editing to support multiple roles.
- `member-management`: Update the administrative interface for managing member roles and board positions.

## Impact

- **Database**: Significant schema changes to `profiles` table; migration of existing data to the new structure.
- **Backend**: RLS policies for `activities`, `voting`, and `governance` must be updated to use `ANY` or `@>` operators for role checks.
- **Frontend**: Several components (Header, AdminPanel, Profile) and hooks (useAuth, useMembers) require updates to handle arrays instead of single strings.
- **Types**: `Profile` interface in `memberUtils.ts` and related files must be updated.
