## Requirements

### Requirement: Profile Data Consistency
The profile page SHALL consistently display the data of the user being viewed, whether it is the authenticated user or another user viewed by an admin.

#### Scenario: Display Target User Data
- **GIVEN** an admin is viewing another user's profile at `/profile/:id`.
- **THEN** all UI elements (Avatar, Name, Email, Role, Member Since) MUST reflect the data of the user with the specified `:id`.
