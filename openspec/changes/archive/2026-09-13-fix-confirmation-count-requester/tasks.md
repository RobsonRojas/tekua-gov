# Tasks: Fix Confirmation Count on Requester Approval

## 1. Backend RPC Update
- [x] Create a new migration file `supabase/migrations/20260823000001_fix_requester_approval_confirmation_record.sql`.
- [x] Copy the current `confirm_activity` function logic.
- [x] In the `requester_approval` block, add the insert query for `activity_confirmations` before returning the JSON object.
