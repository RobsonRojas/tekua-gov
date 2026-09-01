# Proposal: Clean Kanban Card Header & Relocate Confirmations Field

## Why

1. **Redundant Status Chip**: The status column title ("Abertas", "Em Execução", "Para Validar", etc.) already identifies task status. Rendering status chips inside every card clutter the card header and overflow card boundaries.
2. **Inline Confirmation Edit Bottleneck**: Having an inline `<TextField>` on every card for changing minimum confirmations clutters the UI and can lead to accidental changes.
3. **Creation Form Completeness**: Setting required confirmation thresholds should happen during demand/task creation (`CreateDemand.tsx`, `CreateTask.tsx`) and inside the task edit modal (`TaskDetail.tsx`).

## What

- **Remove Status Chip from `ActivityCard.tsx`**:
  - Remove the status `Chip` element from the top card header. Keep the grip drag icon and the reward badge ($S) clean and unconstrained.

- **Convert Card Confirmations Input to Static Label**:
  - Remove the inline `<TextField>` in `ActivityCard.tsx`.
  - Render minimum confirmations purely as a clean text label (`Confirmações: X / Y`).

- **Add Required Confirmations Field to Creation Forms**:
  - Add a `minConfirmations` number input field (default `3`) to `CreateDemand.tsx` and `CreateTask.tsx`.
  - Pass `minConfirmations` to `createActivity` API RPC call.
