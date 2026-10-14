## Context

See proposal.md - Why. The wallet deposit notice already exists in the task and demand create/edit forms (`src/pages/CreateTask.tsx`, `src/pages/CreateDemand.tsx`, `src/pages/TaskDetail.tsx`) but does not state that the value is not divided among executors. The payout logic already credits the full amount to each executor (`supabase/migrations/20260630000000_full_reward_multiple_executors.sql`), so only the message and the stale spec need to change.

## Goals / Non-Goals

**Goals:**
- Make the notice in task and demand create/edit forms explicitly state that the reward value is deposited into each executor's wallet and is **not divided** among executors.
- Reconcile `multi-executor-tasks` with the already-implemented full-value-per-executor behavior.

**Non-Goals:**
- Changing payout logic, wallet behavior, ledger, validation, or database.
- Adding new payout UI or per-executor value breakdowns.

## Decisions

- **Notice wording**: Keep the existing sentence "O valor definido será depositado na carteira de cada um dos executores" and append "Este valor não é dividido entre os executores; cada um recebe o valor integral." Rationale: additive change keeps continuity with the existing message while removing the ambiguity. Alternative: replace the sentence entirely - rejected to preserve the already-reviewed phrasing.
- **Inline `Alert severity="info"` next to the value field**: reuse the existing notice pattern already used in all three forms, to stay visually consistent. Alternative: tooltip/modal - rejected (can be missed / too intrusive).
- **Spec reconciliation instead of a new conflicting requirement**: modify the existing `multi-executor-tasks` requirement rather than adding a parallel one, so the archived spec has a single, accurate distribution rule matching the code.

## Risks / Trade-offs

- **Duplicated requirement with the unarchived `add-wallet-deposit-notice` change** → Both changes add a "Wallet Deposit Notice" requirement with different wording. Mitigation: archive `add-wallet-deposit-notice` before archiving this change, so this change's wording wins; if the reverse order is used, update the notice requirement manually after archiving.
- **Notice may be ignored by users accustomed to the form** → Mitigation: keep it directly next to the value field, in the existing info-alert styling.
