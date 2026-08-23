# Proposal: Fix Confirmation Count on Requester Approval

## The Problem
When an activity uses `requester_approval` (like individual contributions approved by the beneficiary), the `confirm_activity` RPC updates the activity status to `completed` and executes the payout, but it skips inserting a record into the `activity_confirmations` table. As a result, the UI correctly shows the activity as "Concluída", but the confirmation progress bar remains at "0 / 1 Confirmações" (0%).

## The Solution
Modify the `confirm_activity` RPC so that when `validation_method = 'requester_approval'`, it also records the confirmation by inserting the user's ID into the `activity_confirmations` table, similar to how it's done for `community_consensus`.

## Key Features
- Accurate reflection of the confirmation count in the UI.
- The progress bar will correctly show 100% when a beneficiary approves the work.
