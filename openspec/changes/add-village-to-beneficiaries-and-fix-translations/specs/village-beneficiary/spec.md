# Capability: Village Beneficiary and Translation Fixes

## Requirements

### ADDED: Village as Beneficiary Option
- The system MUST include "Vila Tekuá" as a valid option in the Beneficiário dropdown list on demand forms.

#### Scenario: Selecting the village as a beneficiary
- **Given** a user is creating or editing a demand
- **When** they click the Beneficiário dropdown
- **Then** they MUST see "Vila Tekuá" (or similar translation) as an available option to select.

### ADDED: Translation Keys
- The system MUST correctly translate the `work.newProject` and `common.none` keys in both Portuguese and English.

#### Scenario: Viewing the Create Demand form
- **Given** a user is on the Create Demand form
- **When** the page renders
- **Then** the "Novo Projeto" button and "Nenhum" dropdown option MUST display their properly localized strings instead of the raw translation keys.
