## 1. Setup & Shared Utilities

- [x] 1.1 Create unified `apiClient` utility in `src/lib/api.ts` to handle `supabase.functions.invoke`.
- [x] 1.2 Create standard error handling and response types for API calls in the frontend.

## 2. Domain: Audit Logs

- [x] 2.1 Create `api-audit` Edge Function in `supabase/functions/api-audit`.
- [x] 2.2 Implement `fetchLogs` and `logActivity` actions in `api-audit`.
- [x] 2.3 Refactor `src/pages/components/ActivityTab.tsx` to use `apiClient.invoke('api-audit', 'fetchLogs')`.
- [x] 2.4 Refactor `src/utils/activityLogger.ts` to use `apiClient.invoke('api-audit', 'logActivity')`.
- [x] 2.5 Refactor `src/hooks/useAdminActivity.ts` to use `apiClient.invoke('api-audit', 'fetchAdminLogs')`.

## 3. Domain: Wallet & Transactions

- [x] 3.1 Create `api-wallet` Edge Function in `supabase/functions/api-wallet`.
- [x] 3.2 Implement `getBalance`, `fetchTransactions`, and `transfer` actions in `api-wallet`.
- [x] 3.3 Refactor `src/pages/Wallet.tsx` and `src/pages/Profile.tsx` to use the new wallet API.
- [x] 3.4 Move complex validation logic for transfers from database triggers to `api-wallet` Edge Function.

## 4. Domain: Governance & Voting

- [x] 4.1 Create `api-governance` Edge Function in `supabase/functions/api-governance`.
- [x] 4.2 Implement `fetchTopics`, `castVote`, and `saveConfig` actions.
- [x] 4.3 Refactor `src/pages/Voting.tsx` and `src/pages/TopicDetail.tsx` to use the Edge API.

## 5. Domain: Members & Profiles

- [x] 5.1 Create `api-members` Edge Function in `supabase/functions/api-members`.
- [x] 5.2 Implement `updateProfile` and `manageAdmin` actions in the API.
- [x] 5.3 Refactor `src/pages/Profile.tsx` and `src/pages/AdminPanel.tsx` to remove direct profile updates.

## 6. Domain: Work & Tasks

- [x] 6.1 Create `api-work` Edge Function in `supabase/functions/api-work`.
- [x] 6.2 Implement `fetchActivities`, `createActivity`, `submitProof`, and `confirmActivity`.
- [x] 6.3 Refactor `WorkWall.tsx`, `TasksBoard.tsx`, `SubmitTaskProof.tsx`, `RegisterWork.tsx`, and `CreateTask.tsx`.

## 7. Domain: Treasury & AI

- [x] 7.1 Update `api-wallet` to include treasury actions (wallets/transactions list).
- [x] 7.2 Update `api-documents` to support AI Agent document context fetching.
- [x] 7.3 Refactor `AdminTreasury.tsx` and `AIAgent.tsx`.

## 8. Cleanup & Validation

- [x] 8.1 Identify and remove any remaining direct `supabase.from()` calls in the `src/` directory.
- [x] 8.2 Verify that RLS policies are still correctly configured for "defense in depth" (backend security).
- [x] 8.3 Run full build to ensure no regressions in the user journey.
