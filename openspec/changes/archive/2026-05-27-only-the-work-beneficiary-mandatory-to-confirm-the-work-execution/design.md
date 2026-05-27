## Context

When users register work via `submitActivity` in the `api-work` Edge Function, the backend calls the Postgres RPC `submit_activity`. Currently, this RPC defaults the `p_validation_method` to `community_consensus`. Even if a specific beneficiary (`requesterId`) is selected, the system continues to expect the community to confirm the work. Furthermore, the frontend's confirmation action calls `confirmActivity` in `api-work`, which directly inserts a row into `activity_confirmations` without using the robust `confirm_activity` RPC. This circumvents the built-in validation methods (`requester_approval` and `community_consensus`) and prevents the automatic payout and completion of the activity.

## Goals / Non-Goals

**Goals:**
- Automatically assign the `requester_approval` validation method to a contribution when a specific beneficiary is indicated during registration.
- Route all confirmations through the `confirm_activity` RPC so the database can enforce validation rules and trigger automatic payouts.

**Non-Goals:**
- Creating new validation methods.
- Changing the frontend UI components.

## Decisions

- **Dynamic Validation Method in `submitActivity`:** In `api-work`, we will conditionally set `p_validation_method` to `'requester_approval'` if `requesterId` is truthy; otherwise, we explicitly set it to `'community_consensus'`. This will be passed to the `submit_activity` RPC.
- **RPC Integration for `confirmActivity`:** We will replace the direct `supabaseClient.from('activity_confirmations').insert(...)` call with `supabaseClient.rpc('confirm_activity', { p_activity_id: activityId })`. This ensures that all the rich logic (checking rules, executing currency transfer, setting status to completed) runs in a secure, single transaction.

## Risks / Trade-offs

- **Risk:** Existing tasks in `pending_validation` that were created with `community_consensus` but were intended for a specific beneficiary will still require community votes.
  - **Mitigation:** We only focus on new task creation. Existing tasks will follow the rules they were created with. If needed, admins can manually moderate them.
