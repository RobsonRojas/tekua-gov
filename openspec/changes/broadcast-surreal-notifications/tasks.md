## 1. Database Trigger and RPC Setup

- [x] 1.1 Create migration: RPC `notify_surreal_receipt(p_transaction_id UUID)` that fetches transaction data and creates notification records
- [x] 1.2 Create migration: `AFTER INSERT` trigger on `transactions` table to call `notify_surreal_receipt` (only when `from_id IS NOT NULL`)
- [x] 1.3 Add `type` column support in `notifications` table if not already present (or use existing `type` column)
- [x] 1.4 Verify RPC handles edge cases: transaction not found, members count, null profiles

## 2. Backend: api-notifications Extension

- [x] 2.1 Extend `api-notifications` Edge Function to handle `type: 'surreal_receipt'` notifications
- [x] 2.2 Add email template for surreal receipt notifications with i18n (pt/en) support
- [x] 2.3 Email template must include: recipient name, sender name, amount, link to share page, and CTA to work-wall
- [x] 2.4 Test email template rendering and variable substitution

## 3. Backend: Notification Payload Structure

- [x] 3.1 Define `notifications.data` JSON schema for `surreal_receipt` type: `{transactionId, amount, senderName, recipientName, description, createdAt}`
- [x] 3.2 Verify RPC stores all required fields in notification payload
- [x] 3.3 Ensure payload is JSONB compatible and can be queried

## 4. Frontend: Notification UI Integration

- [x] 4.1 Ensure existing notification UI component handles `surreal_receipt` type (should already work if using generic notification display)
- [x] 4.2 Add click handler to notification: when clicked, navigate to `/share/surreal/:transactionId`
- [x] 4.3 Verify notification appears in-app for authenticated users in real-time (use existing notifications subscription if present)

## 5. Testing

- [ ] 5.1 Add test: trigger a surreal transaction and verify notifications are created for all members
- [ ] 5.2 Add test: verify notification payload contains correct transaction data
- [ ] 5.3 Add test: verify email is queued/sent with correct template
- [ ] 5.4 Add test: click notification and verify navigation to `/share/surreal/:transactionId`
- [ ] 5.5 Add integration test: create transaction via wallet transfer → verify notifications appear for recipients
- [ ] 5.6 Manual test: check email delivery (use Resend test account or staging)

## 6. Documentation and Rollout

- [ ] 6.1 Document new RPC `notify_surreal_receipt` in API reference (if applicable)
- [ ] 6.2 Update notification type documentation to include `surreal_receipt`
- [ ] 6.3 Test in staging environment end-to-end: transaction → notifications → email → click link → landing page
- [ ] 6.4 Create rollback plan (disable trigger, keep RPC)
- [ ] 6.5 Deploy migrations and Edge Function updates to production
