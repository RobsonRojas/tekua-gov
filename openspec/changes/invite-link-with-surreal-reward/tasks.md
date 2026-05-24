## 1. Backend Modifications

- [x] 1.1 Add an `invite_token` field (UUID) to the tasks database schema or ensure an existing mechanism exists to generate a unique token per task.
- [x] 1.2 Update the task creation and update endpoints to generate or handle the invite token.
- [x] 1.3 Create a public endpoint `/api/tasks/invite/:inviteToken` to fetch task details (name, description, reward amount) without requiring authentication.
- [x] 1.4 Update the user registration endpoint to accept an optional `invite_token` and automatically enroll the newly created user as a participant in the associated task.

## 2. Frontend - Task Management

- [x] 2.1 Add a QR code generation library (e.g., `qrcode.react`) to the frontend dependencies.
- [x] 2.2 Update the Task Detail UI in the admin/management panel to generate and display the task invitation link based on the task's token.
- [x] 2.3 Render a downloadable QR code on the Task Detail UI that encodes the invitation link.

## 3. Frontend - External Onboarding Flow

- [x] 3.1 Create a new landing page route at `/invite/task/:inviteToken` to display task details and the expected Surreal reward.
- [x] 3.2 Add a call-to-action on the landing page that redirects to the registration form, passing the `invite_token` as a query parameter or storing it in session storage.
- [x] 3.3 Ensure the registration form includes the `invite_token` in the payload sent to the backend when creating the account.

## 4. Testing & Validation

- [x] 4.1 Write integration/unit tests for the backend token validation and automatic task enrollment during signup.
- [x] 4.2 Write E2E Playwright tests verifying the admin flow of generating a task invite and QR code.
- [x] 4.3 Write E2E Playwright tests verifying the external user flow of accessing the invite link, registering, and joining the task.
