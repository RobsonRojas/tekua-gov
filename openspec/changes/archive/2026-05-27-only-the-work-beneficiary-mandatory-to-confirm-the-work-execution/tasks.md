## 1. Backend Modifications (`api-work`)

- [x] 1.1 In `supabase/functions/api-work/index.ts`, update the `submitActivity` action. Check if `requesterId` is present and valid; if so, pass `p_validation_method: 'requester_approval'` to the `submit_activity` RPC, otherwise pass `'community_consensus'`.
- [x] 1.2 In `supabase/functions/api-work/index.ts`, update the `confirmActivity` action. Replace the direct `activity_confirmations` insert with a call to `supabaseClient.rpc('confirm_activity', { p_activity_id: activityId })`.

## 2. Testing

- [x] 2.1 Manually submit a new contribution (Register Work) and specify a beneficiary (requester). Verify in the database that its `validation_method` is `requester_approval`.
- [x] 2.2 Attempt to confirm the task as a standard user (not the beneficiary) and verify it is rejected.
- [x] 2.3 Log in as the beneficiary, confirm the task, and verify it immediately transitions to `completed` and the payout is executed.
