## Why

Currently, when viewing work evidence (such as images), the platform opens them in a new browser tab. This disrupts the user experience, taking them away from the task details context. Opening evidence in a modal provides a smoother, more integrated experience, allowing users to quickly view evidence and close it without losing their place.

## What Changes

- Implement an `EvidenceViewerModal` component to display evidence (like images) in a centered dialog on the screen.
- Update `TaskDetail.tsx` and `ActivityCard.tsx` (and any other relevant places) to trigger this modal with the evidence URL instead of using `window.open(url, '_blank')`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `task-execution`: Update the task progress management requirement to state that evidences are viewed in an integrated modal instead of external tabs.

## Impact

- **UI**: Components that display evidences (`TaskDetail.tsx`, `ActivityCard.tsx`).
- **User Experience**: Smoother, distraction-free viewing experience.
