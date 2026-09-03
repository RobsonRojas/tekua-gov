# Design: Update Payment Model and Admin Wallet Control

## Architecture

### 1. Task Payout Model (Database)
Create a new Supabase migration (e.g., `20260902000000_payout_always_from_treasury.sql`) to override the `confirm_activity` RPC function.
- In both `requester_approval` and `community_consensus` blocks, when calling `execute_currency_transfer`, the first argument (source wallet) MUST always be `NULL` (representing the Treasury).
- Ensure this supports multiple executors if the logic was updated to split amounts among multiple `executors` array elements (as seen in recent migrations).

### 2. Admin Wallet Management (Backend)
- Add a new Edge Function or update an existing one (e.g., `api-admin` or `api-wallet`) to handle a `adjust_wallet_balance` command.
- The function will verify if the calling user is an Admin.
- The function will call a new or existing Postgres RPC (e.g., `execute_currency_transfer` passing `NULL` as source if adding funds, or transferring to `NULL` if burning funds) to properly record the transaction in the ledger.

### 3. Admin Wallet Management (Frontend)
- Update `Admin.tsx` (or `UserManagement` table inside the admin panel) to add an action button to "Ajustar Saldo" (Adjust Balance) next to each user.
- Alternatively, if there's a dedicated `AdminWallet.tsx` or `Treasury` section, add the manual adjustment interface there. The User list in the Admin panel is usually the best place to click "Adjust Balance" for a specific member.
- Display a dialog modal where the Admin enters the `Amount` (can be positive or negative) and `Justification`.
- Call the edge function and show a success/error snackbar, then refresh the user's data.
