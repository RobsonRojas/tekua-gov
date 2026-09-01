# Capability: Card Simplification and Form Confirmations

## Requirements

### Requirement: Simplified Kanban Card Header
Kanban activity cards MUST NOT contain redundant status chips and MUST NOT contain inline confirmation threshold input fields.

#### Scenario: Rendering ActivityCard
- **Given** an activity card on the Work Wall board
- **When** the card renders
- **Then** no status chip MUST be displayed inside the card
- **And** the minimum required confirmations MUST be rendered as a plain text label (`Confirmações: X / Y`) without any input field.

### Requirement: Creation & Editing Confirmations Field
Users MUST be able to define the minimum required confirmations (`minConfirmations`) when creating a task/demand and edit it via the task edit form.

#### Scenario: Creating a new demand
- **Given** a user is creating a demand on `CreateDemand.tsx` or `CreateTask.tsx`
- **When** submitting the form
- **Then** a `minConfirmations` field MUST allow specifying the required confirmations count (defaulting to 3)
- **And** it MUST be saved to the backend database.
