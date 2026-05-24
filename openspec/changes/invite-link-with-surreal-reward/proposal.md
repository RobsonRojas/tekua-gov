## Why

Administrators need a way to invite external people to participate in specific Tekuá activities or challenges. By providing an invitation link and a QR code for a task, external members can easily join, register, and be rewarded with Surreais upon completing the challenge. This expands the reach of the platform and incentivizes new user acquisition and engagement through targeted activities.

## What Changes

- Add the ability for administrators to generate an invitation link and a QR code for a specific task.
- Create an onboarding flow for external users who access the platform via a task invitation link.
- Automatically associate the newly registered user with the task.
- Ensure the user is rewarded with Surreais upon successful completion of the task.

## Capabilities

### New Capabilities
- `task-external-invites`: Generation of task-specific invitation links and QR codes by administrators, including the flow for external users to accept the invite, register, and be linked to the task for subsequent Surreal rewards.

### Modified Capabilities
- `task-execution`: Update to handle users joining tasks via external invites.
- `wallet-system`: Update to ensure rewards are properly processed for tasks completed via external invites.

## Impact

- **UI/UX**: Task detail pages will need new UI elements for admins to generate and view the QR code/invite link. The registration flow will need an alternate path for invited users.
- **Backend Services**: Updates to task management and user registration endpoints to handle invite tokens.
- **Database**: Task records may need to store invite token data, and user records might need to track the origin of registration (invite link).
