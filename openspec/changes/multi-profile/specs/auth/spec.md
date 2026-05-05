## MODIFIED Requirements

### Requirement: User Authentication
Users SHALL be able to securely authenticate. Upon successful authentication, the system SHALL load the user's profile including all assigned roles and functions to establish the session context.

#### Scenario: Successful Login with Multiple Roles
- **WHEN** A user provides valid credentials.
- **THEN** The system SHALL load all assigned roles (e.g., ['admin', 'member']) into the session state.
