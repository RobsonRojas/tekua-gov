## Why

The task moderation buttons (Approve and Reject) currently display their raw translation keys (`common.approve`, `common.reject`) instead of localized text. Furthermore, users with the "transversal council" role are unable to moderate tasks because the backend permission check is outdated, relying on a legacy singular `role` field instead of the new plural `roles` array.

## What Changes

- Add missing Portuguese and English translations for `common.approve` and `common.reject`.
- Update the `api-work` Edge Function to correctly validate user permissions using the `roles` array, ensuring compatibility with the "transversal council" and "admin" roles.
- Ensure all moderation and payout audit checks in the backend use the updated multi-role system.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `activity-moderation`: Update the requirement for permission validation to use the multi-role system (`roles` array) instead of the legacy singular role.

## Impact

- **Frontend**: `ActivityCard.tsx` and `PayoutAudit.tsx` will display correct labels.
- **Backend**: `api-work` Edge Function moderation and payout audit logic.
- **Database**: The `profiles` table's `roles` column becomes the primary source of truth for authorization in `api-work`.
