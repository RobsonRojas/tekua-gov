## 1. Database & Backend

- [x] 1.1 Create Supabase migration to add `roles` and `functions` (text array) columns to `profiles`
- [x] 1.2 Implement data migration script within the migration file to populate new columns from existing data
- [x] 1.3 Update the `profiles_role_check` constraint to validate array contents against allowed roles
- [x] 1.4 Update `public.is_transversal_council_or_admin()` function to use array membership checks
- [x] 1.5 Update RLS policies for `profiles` table to support multi-role visibility logic
- [x] 1.6 Update RLS policies for `activities`, `votes`, and `ledger_entries` to use the updated `roles` array
- [x] 1.7 Update `moderate_activity` and `submit_activity` RPC functions to handle multi-role checks

## 2. Core Types & Hooks

- [x] 2.1 Update `Profile` interface in `src/utils/memberUtils.ts` to use `roles: string[]` and `functions: string[]`
- [x] 2.2 Refactor `isBoardMember` and `getBoardRoleDisplay` utilities to work with the new array structures
- [x] 2.3 Update `useAuth` hook to correctly parse and store the roles array in the application state
- [x] 2.4 Update `useMembers` hook's `inviteMember` and `updateMember` functions to handle multiple roles

## 3. UI Components & Display

- [x] 3.1 Update the `Header` component to display multiple roles/badges for the current user
- [x] 3.2 Update `ActivityCard` and moderation views to correctly identify users with appropriate roles
- [x] 3.3 Update the `Profile` page to list all active roles and organizational functions
- [x] 3.4 Update the `Home` and `Dashboard` components to show appropriate sections based on any of the user's active roles

## 4. Administrative Interface

- [x] 4.1 Update the member list table in `MemberManagement` to display multiple chips for roles/functions
- [x] 4.2 Update the member editing dialog to use a multi-select component (chips/checkboxes) for assigning roles
- [x] 4.3 Update the member invitation form to allow selecting multiple initial roles
- [x] 4.4 Implement a "Functions" management UI within the member editor for arbitrary organizational titles

## 5. Testing & Verification

- [x] 5.1 Update existing Vitest unit tests for components that rely on the single `role` field
- [x] 5.2 Add new unit tests for `memberUtils` with various multi-role combinations
- [x] 5.3 Verify RLS policies manually or via Playwright by testing access with hybrid roles (e.g., Admin + Member)
