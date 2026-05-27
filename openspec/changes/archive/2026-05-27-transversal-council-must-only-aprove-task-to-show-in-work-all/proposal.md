## Why

Currently, there may be an issue with how tasks created by users transition to the Work Wall. The requirement is that tasks (demands) created by standard users must require approval from the Transversal Council before they appear on the public Work Wall. This ensures that all tasks align with the platform's goals and governance before others can claim or interact with them. 

## What Changes

- Ensure all newly created tasks default to a `pending_approval` state.
- Ensure the Work Wall only displays tasks to standard users if they are in an `open` or further state.
- Ensure the Transversal Council's moderation action transitions the task from `pending_approval` to `open` (making it visible on the Work Wall).

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `transversal-council-workflow`: Emphasize that standard task creation requires Council approval to be visible in the Work Wall.
- `work-wall-responsive-navigation`: Ensure visibility of unapproved tasks is restricted.

## Impact

- **UI/UX**: Users creating tasks will see them as pending until approved. Standard users won't see pending tasks on the Work Wall.
- **Backend APIs**: The task creation endpoints and moderation endpoints (`api-work` and `moderate_activity` RPC) must handle the state transition to `open`.
