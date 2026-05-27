## Why

Currently, when users register completed work for a specific beneficiary, the system defaults the validation method to community consensus. This means the community has to validate it, rather than the actual person who received the work. The user requested that for work registration, only the beneficiary should be required to confirm the work. Additionally, the backend `confirmActivity` endpoint is currently bypassing the robust `confirm_activity` RPC that handles validation methods and automated payouts.

## What Changes

- Update the `submitActivity` logic in the `api-work` Edge Function so that if a beneficiary (`requesterId`) is specified, the validation method is explicitly set to `requester_approval` instead of the default `community_consensus`.
- Update the `confirmActivity` logic in the `api-work` Edge Function to use the `confirm_activity` RPC (which properly evaluates validation methods and handles state transitions) instead of directly inserting a row into `activity_confirmations`.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `work-registration`: Update the submission logic to automatically use `requester_approval` when a beneficiary is indicated.
- `community-validation`: Update the confirmation logic in the backend to correctly route through the established `confirm_activity` RPC, ensuring `requester_approval` and `community_consensus` rules are strictly enforced.

## Impact

- **Backend APIs**: `api-work` Edge Function is updated for `submitActivity` and `confirmActivity`.
- **Database Rules**: Existing RPC `confirm_activity` will finally be utilized as originally designed, fixing the validation and automated payout process.
- **UI/UX**: Beneficiaries will be able to confirm tasks and instantly mark them as completed without waiting for community votes.
