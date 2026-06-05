## Why

Currently, when a work is registered with `requester_approval`, only the requester/beneficiary can confirm the work. This creates a bottleneck if the beneficiary is unavailable or unable to confirm. Allowing system administrators to also confirm the work ensures that tasks can be properly completed and rewards distributed without being blocked by the beneficiary.

## What Changes

- Update the validation logic for tasks to allow both the beneficiary and system administrators to confirm a task.
- Ensure the UI displays the confirm button for administrators even if they are not the beneficiary.
- Ensure the backend RPC `confirm_activity` allows administrators to confirm the activity.

## Capabilities

### New Capabilities

### Modified Capabilities
- `community-validation`: Modify the requirement to allow system administrators to confirm tasks that use `requester_approval` validation method, in addition to the beneficiary.

## Impact

- **UI**: The Work Wall / Task Details page where the confirm button is displayed.
- **Backend/DB**: The `confirm_activity` RPC and relevant logic that checks permissions for task validation.
