## MODIFIED Requirements

### Requirement: Profile Visualization
Authenticated users SHALL be able to view and manage their personal profile details.

#### Scenario: View Profile
- **GIVEN** An authenticated user visits the profile page.
- **THEN** The user's full name, email, role, and joined date are displayed accurately.

#### Scenario: Edit Profile Name
- **GIVEN** An authenticated user enters a new name and clicks "Salvar".
- **THEN** The user's name is updated in the database and reflected in the UI.

#### Scenario: Admin View Other User Profile
- **GIVEN** An authenticated user with "admin" role.
- **WHEN** The admin visits the profile page with a target user ID (`/profile/:id`).
- **THEN** The system SHALL fetch and display the full name, email, role, and joined date of the target user.

#### Scenario: Unauthorized Access to Other User Profile
- **GIVEN** An authenticated user with "member" role.
- **WHEN** The user visits the profile page with another user's ID (`/profile/:other_id`).
- **THEN** The system SHALL redirect the user back to their own profile and display an access error.
