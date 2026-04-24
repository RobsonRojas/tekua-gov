# Design: refactor-integrity-i18n-unification

## Database Schema Changes

### `topic_comments`
- **Change**: Rename `content` (TEXT) to `content_old` and create `content` (JSONB).
- **Migration**: Wrap existing text into `{"pt": content, "en": content}`.

### `transactions`
- **Change**: Add `activity_id` (UUID) referencing `activities(id)`.
- **Index**: Create index on `activity_id`.

## RPC Logic Updates

### `execute_currency_transfer`
- **New Signature**: Accept `p_activity_id` and store it in the new column.

### `confirm_activity`
- **Refinement**: Ensure it logs to `activity_logs` and handles all reward-based payouts.

## Frontend Adjustments

### `TopicDetail.tsx`
- Implement `getLocalized` for comments.
- Update comment submission to send a JSONB object (defaulting current UI language as the key).

### `Wallet.tsx`
- Update transaction listing to show a link to the related activity if `activity_id` is present.
