## ADDED Requirements

### Requirement: Authentication Rate Limiting Feedback
The system SHALL provide immediate feedback when users exceed the authentication endpoint rate limit, preventing further duplicate requests until the limit resets or a cooldown period elapses.

#### Scenario: Rate Limit Reached on Registration
- **WHEN** user clicks "Register" and the system returns a rate limit exceeded error
- **THEN** system displays a user-friendly error message indicating too many attempts and disables the submit button temporarily
