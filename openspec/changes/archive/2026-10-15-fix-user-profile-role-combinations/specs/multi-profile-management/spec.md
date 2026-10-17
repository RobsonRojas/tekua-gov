## MODIFIED Requirements

### Requirement: Role Assignment
Administrators SHALL be able to assign or remove multiple roles and functions for any member. The system SHALL explicitly permit any combination of core profile types, including simultaneously holding 'member' and 'transversal_council' roles, without mutual exclusivity restrictions.

#### Scenario: Assigning an additional role
- **WHEN** an administrator selects an additional role for a member and saves
- **THEN** the member's profile SHALL be updated to include the new role while retaining previous ones

#### Scenario: Assigning member and transversal_council simultaneously
- **WHEN** an administrator assigns both 'member' and 'transversal_council' to a user
- **THEN** the system SHALL allow the assignment and reflect both roles on the user's profile
