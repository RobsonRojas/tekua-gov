# Tasks: Clean Kanban Card Header & Relocate Confirmations Field

## Implementation Tasks

- [x] **1. Remove Status Chip from `ActivityCard.tsx`** <!-- id: 1 -->
  - Remove status `Chip` element from the top card header.

- [x] **2. Convert Inline Confirmation Field to Static Text (`ActivityCard.tsx`)** <!-- id: 2 -->
  - Remove `<TextField>` input field from the confirmations row.
  - Render static label `Confirmações: X / Y`.

- [x] **3. Add Confirmations Field to Creation Forms (`CreateDemand.tsx`, `CreateTask.tsx`)** <!-- id: 3 -->
  - Add `minConfirmations` field with default value `3`.
  - Pass `minConfirmations` in payload to `createActivity`.

- [x] **4. Build & Visual Verification** <!-- id: 4 -->
  - Verify card header cleanliness and form submission.
  - Ensure 0 compilation errors.
