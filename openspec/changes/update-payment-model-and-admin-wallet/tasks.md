# Tasks: Update Payment Model and Admin Wallet Control

- [x] Task 1: Create a Supabase SQL migration to update the `confirm_activity` RPC so that all `execute_currency_transfer` calls use `NULL` as the source wallet (no deduction from requester/beneficiary).
- [x] Task 2: Create a Supabase SQL migration to add a secure `admin_adjust_wallet_balance` RPC function (or ensure existing tools handle it) that allows Admins to mint/burn surreais from/to a user's wallet and records it in the ledger.
- [x] Task 3: Update an Edge Function (e.g., `api-admin` or `api-wallet`) to expose the balance adjustment feature securely to the frontend.
- [x] Task 4: Update the frontend Admin Panel (`Admin.tsx`) to include UI controls (button and dialog modal) for Administrators to adjust a specific user's balance and provide a justification.
