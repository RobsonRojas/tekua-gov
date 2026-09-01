# Proposal: Add Action History and Fix Task Confirmation in Demand Details View

## Why

1. **Action History**: Currently, when users view the details of a demand/task (`TaskDetail`), they can see current status, validation progress, and comments, but there is no integrated visual timeline showing the chronological history of actions performed on the demand (creation, edits, claiming, proof submissions, approvals, confirmations). Users need full auditability and transparency into the demand's lifecycle.
2. **Task Confirmation Fix**: Clicking the "Confirmar Tarefa" / "Aprovar Trabalho" button on certain demand statuses (such as `pending_validation` or when RPC returns `{ success: false }`) fails to process or increment the confirmation count because `handleAction` only handled `pending_approval` and didn't throw on RPC error responses.

## What

- **Action History Timeline**:
  - Add a dedicated Action History ("Histórico de Ações") component/section in `TaskDetail`.
  - Display all historical events in chronological order (Creation, Edits, Claiming/Assignment, Evidence Uploads, Confirmations & Approvals, Status Transitions).
  - Include user details (avatar, full name), event action badge, timestamp, and metadata.

- **Task Confirmation Fix**:
  - Update `handleAction` in `TaskDetail.tsx` to handle `pending_validation` as well as `pending_approval`.
  - Update `confirmActivity` handler in `api-work` edge function to properly check RPC response `{ success: false, error: ... }` and throw errors so frontend receives error state or updates correctly.
  - Ensure confirmation count and user confirmation state (`user_has_confirmed`) update reactively upon successful confirmation.

## Impact

- **User Experience**: Immediate feedback when confirming tasks and clear visual audit timeline of all past actions on any demand.
- **Data Integrity**: Accurate tracking of confirmation counts and task completion transitions across all demand statuses.
- **Backwards Compatibility**: Fully backwards-compatible UI and API enhancement.
