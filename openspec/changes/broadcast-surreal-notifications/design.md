## Context

See proposal.md - Why. Current state: the wallet system records transactions in `transactions` table via RLC policies and RPC functions. Notifications are sent via `api-notifications` Edge Function, which supports push and email delivery. The landing page for shared surreals already exists (`/share/surreal/:shareId`).

Challenge: transactions are created atomically in the database (RPC `perform_transfer`, `admin_mint_currency`, etc.), so we need a database trigger or RPC-level call to dispatch notifications without adding latency or risk of failure to the primary transaction.

## Goals / Non-Goals

**Goals:**
- When any surreal transaction is created (received), broadcast notifications (app + email) to all members
- Notifications link to the public receipt page and include transaction details
- Notifications include motivation to earn surreais (link to work-wall)
- No increase in latency for wallet operations
- Graceful handling of invalid/non-existent share IDs

**Non-Goals:**
- Notifications for minting transactions (treasury-only actions) - only for peer-to-peer transfers
- Custom notification preferences per user (all members receive all notifications)
- Real-time updates or subscription-based notification streaming
- Notification archival or long-term retention policy (use existing retention rules)

## Decisions

### Decision 1: Use database trigger (not Edge Function) to dispatch notifications
**Rationale**: Transactions are created via RPC (`perform_transfer`, `admin_mint_currency`). Calling an Edge Function from within the RPC would require async polling or webhook, which adds complexity. A trigger on `transactions.INSERT` can call an RPC (`notify_surreal_receipt`) atomically.

**Alternatives considered**:
- Edge Function called post-transaction: adds latency, single point of failure for notifications, complicates retry logic.
- Async queue (Supabase jobs): requires external infrastructure, adds polling overhead.

**Chosen**: Trigger ? RPC to keep notifications part of the transaction atomicity.

### Decision 2: Filter transactions by `from_id IS NOT NULL` to exclude minting
**Rationale**: Minting transactions (`from_id = NULL`) are treasury-only and should not generate community notifications. Only peer-to-peer transfers and rewards (where `from_id` is set) should trigger broadcasts.

**Alternatives considered**:
- Separate minting table: more complex schema, breaks existing code.
- Notification type flag on transaction: requires schema change, still needs trigger.

**Chosen**: Trigger condition `NEW.from_id IS NOT NULL`.

### Decision 3: Notification payload stores transaction ID, sender/recipient names, and amount
**Rationale**: Sender and recipient names (not IDs) should be resolved at transaction creation time and stored in `notifications.data` as a JSON structure. This avoids N+1 queries when rendering notifications and survives if the profiles are later modified/deleted.

**Alternatives considered**:
- Store only transaction ID, fetch names at render time: requires JOIN on every notification display.
- Store IDs, resolve at Email/Push send time: adds latency, complexity.

**Chosen**: Store full transaction details in `notifications.data` at creation time.

### Decision 4: Email template is handled by `api-notifications` with a new type "surreal_receipt"
**Rationale**: Notifications table already has a `type` column and `api-notifications` already handles multi-type emails. Extending it is simpler than adding new email logic elsewhere.

**Alternatives considered**:
- New Edge Function just for surreal emails: duplicates email sending logic, harder to maintain.

**Chosen**: Add `type: 'surreal_receipt'` handling in `api-notifications` Edge Function.

### Decision 5: Public share endpoint reuses existing `api-public` function with new action `getShareSurrealReceipt`
**Rationale**: `api-public` already handles public, rate-limited reads. Adding a new action is less disruptive than creating a new Edge Function.

**Alternatives considered**:
- New Edge Function `api-share-receipt`: more modular but requires new error handling, rate limiting, CORS setup.

**Chosen**: Extend `api-public` with `getShareSurrealReceipt` action (already done in feature branch).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Trigger fires for every transaction, even test data | Add `skip_trigger` flag in transaction context, or use test-specific profiles that are filtered by WHERE clause. |
| Notification payload grows if we add more transaction metadata | Use `transactions` view or computed column to avoid duplication. Payload is JSONB, scales well. |
| Email template requires i18n (pt/en) | Use existing i18n infrastructure in `api-notifications` (already supports multi-language templates). |
| Invalid/deleted transaction ID in share URL | API returns 404, landing page shows "Link invalid or expired". Safe. |
| Database trigger complexity (PL/pgSQL) | Start simple: notify all members. Add opt-out/preferences in future. |

## Migration Plan

1. **Create database RPC** `notify_surreal_receipt(p_transaction_id UUID)` in Supabase migrations
   - Fetches transaction details
   - Creates notification records for all members (except sender)
   - Calls `api-notifications` or enqueues email jobs
2. **Create database trigger** on `transactions` table: `AFTER INSERT` calls `notify_surreal_receipt`
3. **Extend `api-notifications`** Edge Function to handle `type: 'surreal_receipt'` with email template
4. **Verify public API** `getShareSurrealReceipt` action in `api-public` (already implemented)
5. **Test end-to-end**: create test transaction, verify notifications appear for all members
6. **Rollback**: Drop trigger, keep RPC (can be called manually if needed)

## Open Questions

- Should we notify the **recipient** themselves? (Currently: all members except sender.) Consider: they already know they received surreais when the transaction completes. Notification is for community visibility. Answer: exclude recipient from notification list to avoid noise.
- Should we batch notifications if multiple transactions occur in quick succession? (e.g., send one daily digest instead of N emails per day?) Answer: defer to future phase; start with real-time, add digest mode later.
