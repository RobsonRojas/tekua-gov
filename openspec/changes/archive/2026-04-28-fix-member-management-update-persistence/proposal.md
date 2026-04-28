## Why

In the Member Management module, editing a member's profile often leads to data loss or UI inconsistency:
1. When an admin updates both a member's role and their name, the name update is ignored because the `api-members` Edge Function's `manageAdmin` action only handles the `role` field.
2. The `MemberEditModal` component has redundant code (double imports) and needs cleanup to ensure it correctly triggers a refresh of the member list.

## What Changes

- **Edge Function**: Update `api-members` to ensure that role updates and profile updates can be performed concurrently or that the `manageAdmin` action also accepts other profile fields.
- **Frontend Hook**: Refactor `useMembers` hook to correctly handle the persistence of all fields.
- **Frontend UI**: Clean up `MemberEditModal.tsx` and ensure the `onSave` callback is properly executed after a successful update.

## Capabilities

### Modified Capabilities
- `member-management`: Ensure all profile fields updated by an admin are correctly persisted and reflected in the UI.

## Impact

- **APIs**: `api-members` Edge Function logic for `manageAdmin` and `adminUpdateProfile`.
- **Frontend**: `MemberManagement.tsx`, `MemberEditModal.tsx`, and `useMembers.ts`.
