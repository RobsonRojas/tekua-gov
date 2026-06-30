## MODIFIED Requirements

### Requirement: User Authentication
Users SHALL be able to securely authenticate and register. Upon successful authentication, the system SHALL load the user's profile including all assigned roles and functions to establish the session context. Registration attempts SHALL be protected against accidental duplicate submissions.

#### Scenario: Successful Login with Multiple Roles
- **WHEN** A user provides valid credentials.
- **THEN** The system SHALL load all assigned roles (e.g., ['admin', 'member']) into the session state. token is generated, and the user is redirected to the dashboard.

#### Scenario: Session Logout
- **WHEN** An authenticated user clicks logout.
- **THEN** The session is terminated, and the user is redirected to the login page.

#### Scenario: Prevention of Duplicate Registration Submission
- **WHEN** A user clicks the registration submit button
- **THEN** The system immediately disables the button and shows a loading state until a response is received, preventing duplicate requests.
