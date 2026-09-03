# Capability: Demand Beneficiary Selection

## Requirements

### ADDED: Beneficiary Field in Demand Form
The demand creation and edit forms MUST include a field to select a beneficiary.

#### Scenario: User creates a new demand with a beneficiary
- **Given** the user is on the "Create Demand" form
- **When** they fill out the demand details and select a "Beneficiário" from the dropdown/autocomplete
- **Then** the demand MUST be created and successfully linked to the chosen beneficiary.

#### Scenario: User edits an existing demand to change the beneficiary
- **Given** the user is editing an existing demand
- **When** they change the selected "Beneficiário"
- **Then** the updated beneficiary information MUST be saved to the database.
