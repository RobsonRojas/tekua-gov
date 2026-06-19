## MODIFIED Requirements

### Requirement: User Management
Administrators SHALL be able to list and manage all system users. The user list SHALL include each member's current Surreal (SR$) wallet balance as an additional data column.

#### Scenario: Toggle User Role
- **GIVEN** An administrator clicks the 'Tornar Administrador' action on a 'member' user.
- **THEN** The user's role is updated in the database and the UI reflects the change.

#### Scenario: Search Member
- **GIVEN** An administrator types 'Alice' into the search bar.
- **THEN** The list is filtered to only show users whose name contains 'Alice'.

#### Scenario: Surreal balance column visible in user list
- **WHEN** an administrator views the user management table
- **THEN** the system SHALL display a "Saldo SR$" column for each member showing their current wallet balance
