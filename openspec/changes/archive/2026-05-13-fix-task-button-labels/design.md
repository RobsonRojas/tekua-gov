## Context

The system recently migrated to a multi-role architecture where a user can have multiple roles stored in a `roles` (TEXT[]) column in the `profiles` table. However, some backend components (specifically the `api-work` Edge Function) still rely on the legacy `role` (TEXT) column for permission checks. This causes users who have been assigned roles via the new system (like "transversal_council") to be denied access because their legacy `role` field might be set to "member" or be empty.

Additionally, some UI labels for moderation actions were using translation keys that weren't defined in the localization files.

## Goals / Non-Goals

**Goals:**
- Fix translation keys for "Approve" and "Reject" actions.
- Update `api-work` Edge Function to use the `roles` array for all permission checks (admin and transversal council).
- Ensure backward compatibility where possible by checking both `role` and `roles` if necessary, although `roles` should be preferred.

**Non-Goals:**
- Migrating all legacy data from `role` to `roles` (this should be handled by a database migration if not already done).
- Changing the UI layout or adding new features to the moderation flow.

## Decisions

### 1. Update Permission Checks in `api-work`
**Decision:** Modify the role retrieval logic in `supabase/functions/api-work/index.ts` to select `roles` instead of `role`, and use array inclusion checks.
**Rationale:** The `roles` column is the new source of truth for user permissions.
**Alternatives:**
- Keep using `role` and ensure it's always synced. (Rejected: Redundant and prone to sync errors).
- Create a shared utility for role checks in Edge Functions. (Selected: Although for this quick fix, direct implementation in the function is fine, we should look for shared patterns).

### 2. Localization Additions
**Decision:** Add `approve` and `reject` keys to the `common` section of `translation.json`.
**Rationale:** Standardizes common action labels across the app.

## Risks / Trade-offs

- **Risk:** Some older profiles might not have the `roles` array initialized correctly.
- **Mitigation:** The logic should fallback to the `role` field if `roles` is null or empty, or we should ensure the migration `20260502095800_multi_profile_support.sql` has been applied successfully to all users.
