## Why

Task descriptions are currently not displayed in the task wall or detail view due to an implementation error in the registration process where descriptions are stored as plain strings instead of internationalized objects. Furthermore, the platform lacks a mechanism for users to interact with tasks beyond simple execution, missing opportunities for clarification or supplementary information requests.

## What Changes

- **Fix Task Metadata Storage**: Update the `RegisterWork` component to correctly send internationalized description objects to the backend, ensuring compatibility with the frontend's multilingual display logic.
- **Implement Task Interactions**: Introduce a "Questions and Comments" section on the task detail page.
  - New database table `activity_comments` to store user interactions related to specific tasks.
  - New API actions to fetch and post comments/questions.
  - UI components in `TaskDetail` to display the interaction history and allow users to post new messages.

## Capabilities

### New Capabilities
- `task-interactions`: Provides a communication channel for members to ask questions, request additional information, or provide feedback on specific tasks and contributions.

### Modified Capabilities
- `work-registration`: Update requirements to ensure all activity metadata (title and description) are strictly handled as internationalized objects to prevent display failures.

## Impact

- **Database**: New table `activity_comments`.
- **Backend**: Updated `api-work` edge function and potentially new RPCs for interactions.
- **Frontend**: Modified `RegisterWork.tsx` (bug fix) and `TaskDetail.tsx` (new feature).
- **i18n**: New translation keys for the interaction UI.
