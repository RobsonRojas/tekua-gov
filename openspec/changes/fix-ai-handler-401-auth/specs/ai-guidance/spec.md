## ADDED Requirements

### Requirement: Session-Resilient AI Communication
The AI agent client SHALL validate and ensure a fresh authentication token before making requests to the AI edge function, and SHALL handle authentication failures gracefully with automatic recovery.

#### Scenario: Expired session triggers automatic refresh
- **WHEN** the user sends a message to the AI agent and the current session token is expired or null.
- **THEN** the system SHALL automatically attempt to refresh the session via Supabase auth refresh, and retry the request with the new token.

#### Scenario: Successful token refresh enables AI request
- **WHEN** a token refresh succeeds after detecting an expired session.
- **THEN** the AI request SHALL proceed normally with the refreshed token, and the user SHALL not see any error.

#### Scenario: Failed token refresh shows re-login prompt
- **WHEN** the session cannot be refreshed (e.g., refresh token also expired, user was logged out).
- **THEN** the system SHALL display a clear, localized error message informing the user their session has expired and prompting them to log in again.

#### Scenario: 401 response triggers single retry with refreshed token
- **WHEN** the AI edge function returns a 401 status code.
- **THEN** the system SHALL attempt exactly one token refresh and retry. If the retry also fails with 401, the system SHALL display the re-login error message.

#### Scenario: Missing token prevents request entirely
- **WHEN** no session token exists and refresh also yields no token.
- **THEN** the system SHALL NOT send the request and SHALL immediately display the re-login error message.
