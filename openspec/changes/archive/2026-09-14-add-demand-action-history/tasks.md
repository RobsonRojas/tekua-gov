# Implementation Tasks: Add Demand Action History & Fix Confirmation

## 1. Backend Edge Function Updates (`api-work`)

- [x] 1.1 Update `confirmActivity` in `supabase/functions/api-work/index.ts` to check RPC response for `success === false` and throw an error with the detailed message.
- [x] 1.2 Verify `fetchActivityDetail` in `api-work` returns complete `confirmations` with `profile` object (id, full_name, avatar_url).

## 2. Task Confirmation Frontend Fix (`TaskDetail.tsx`)

- [x] 2.1 Update `handleAction` in `TaskDetail.tsx` to handle both `pending_approval` and `pending_validation` statuses when calling `confirmActivity`.
- [x] 2.2 Ensure clicking "Confirmar Tarefa" / "Aprovar Trabalho" triggers `fetchDetail()` and updates `user_has_confirmed` state and confirmation count immediately.
- [x] 2.3 Add user feedback error alert/snackbar if `confirmActivity` fails (e.g., user already confirmed or unauthorized).

## 3. Demand Action History Component & Integration

- [x] 3.1 Create `src/components/work/DemandActionHistory.tsx` timeline component.
- [x] 3.2 Implement event aggregation logic combining task creation, claim/assignment, evidence submission, confirmations, and completion.
- [x] 3.3 Add internationalization (i18n) keys for action history titles and action event descriptions (PT and EN).
- [x] 3.4 Embed `DemandActionHistory` inside `TaskDetail.tsx` above or alongside `TaskInteractions`.

## 4. Testing & Verification

- [x] 4.1 Verify clicking "Confirmar Tarefa" increments confirmation count and updates the progress bar.
- [x] 4.2 Verify the "Histórico de Ações" section renders all actions in chronological order with correct user avatars and timestamps.
- [x] 4.3 Verify layout responsiveness and dark theme aesthetics.
