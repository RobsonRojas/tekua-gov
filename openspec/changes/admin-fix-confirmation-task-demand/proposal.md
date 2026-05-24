## Why

The Governance Configuration in the Admin Panel is currently failing to save the validation threshold (minimum number of confirmations required for automatic payment). Consequently, when new tasks (demands) are created, they do not pick up the correct required number of approvals from the global configuration. This breaks the community validation flow, as tasks might be created with an incorrect threshold, undermining the platform's governance rules.

## What Changes

- Fix the Admin Panel's Governance Configuration form so that the validation threshold is correctly saved to the backend database.
- Update the task creation logic to ensure it fetches and applies the globally configured validation threshold when a new task is created.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `admin-governance-config`: The form saving mechanism for governance configuration needs to correctly persist the validation threshold.
- `community-validation`: Task creation must properly inherit the global validation threshold instead of a hardcoded or missing value.

## Impact

- **UI/UX**: The Admin Panel Governance settings will now accurately reflect the saved state.
- **Backend APIs**: The task creation endpoint (`api-work` or similar) will need to read from the governance configuration table.
- **Database**: The tasks (`activities`) table will now correctly store the `min_confirmations` required for validation based on global settings.
