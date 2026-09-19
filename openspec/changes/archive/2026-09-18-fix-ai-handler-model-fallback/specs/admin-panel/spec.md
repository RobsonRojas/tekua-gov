## ADDED Requirements

### Requirement: AI Settings Management
Administrators SHALL be able to configure the default AI model to be used by the system.

#### Scenario: Update Default AI Model
- **WHEN** an administrator accesses the AI settings in the admin panel and selects a new default model
- **THEN** the system updates the configuration in the database and subsequent AI requests use the newly selected model by default.
