# Design: Fix Confirmation Count on Requester Approval

## 1. Architecture
- **Backend (Supabase RPC):** We will update the `confirm_activity` function. Inside the `IF v_activity.validation_method = 'requester_approval'` block, we will add an `INSERT INTO activity_confirmations (activity_id, user_id) VALUES (p_activity_id, v_user_id) ON CONFLICT DO NOTHING;` to ensure the confirmation is explicitly recorded.
- **Frontend:** No changes required, as `TaskDetail.tsx` relies on the count of `activity_confirmations` returned by the backend. Once the record is created, the UI will automatically update on the next refetch.

## 2. API / Database Changes
- We will create a new migration `supabase/migrations/20260823000001_fix_requester_approval_confirmation_record.sql` that updates the `confirm_activity` RPC.

## 3. UI/UX Flow
- User (Beneficiary) clicks "Aprovar Trabalho".
- The activity goes to "Concluída".
- The progress bar shows 100% and "1 / 1 Confirmações".
