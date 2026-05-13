## MODIFIED Requirements

### Requirement: Profile Visualization
Authenticated users SHALL be able to view and manage their personal profile details, including all active roles and organizational functions within the organization.

#### Scenario: View Profile
- **GIVEN** An authenticated user visits the profile page.
- **THEN** The user's full name, email, all active roles, organizational functions (e.g., positions in the board or council), and joined date are displayed accurately.

#### Scenario: Admin View Other User Profile
- **GIVEN** An authenticated user with "admin" role.
- **WHEN** The admin visits the profile page with a target user ID (`/profile/:id`).
- **THEN** The system SHALL fetch and display the full name, email, all active roles, and organizational functions of the target user.
