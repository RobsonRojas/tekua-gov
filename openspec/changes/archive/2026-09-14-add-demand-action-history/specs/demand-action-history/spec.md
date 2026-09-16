# Capability: Demand Action History & Confirmation Fix

## Requirements

### Requirement: Demand Action History Timeline
The system MUST render a dedicated action history timeline in the demand detail view (`TaskDetail`), listing all historic actions recorded for the demand in chronological order.

#### Scenario: Display action history events
- **Given** a user is viewing a demand detail page
- **When** the demand detail loads
- **Then** an "Histórico de Ações" section MUST display a timeline of all recorded activity events
- **And** each history item MUST show the actor's avatar, full name, action type (Created, Edited, Claimed, Proof Submitted, Confirmed/Approved, Status Changed), formatted date/time, and relevant details.

#### Scenario: Real-time update of action history
- **Given** a user performs an action on the demand detail view (such as confirming the task or submitting evidence)
- **When** the action completes successfully
- **Then** the action history timeline MUST refresh automatically to include the new action event.

---

### Requirement: Reliable Task Confirmation Action
The system MUST reliably record user confirmations and increment the confirmation count when a user clicks "Confirmar Tarefa" or "Aprovar Trabalho".

#### Scenario: Confirming task in pending_approval or pending_validation status
- **Given** a user with confirmation permissions is viewing a demand in `pending_approval` or `pending_validation` status
- **When** the user clicks "Confirmar Tarefa" or "Aprovar Trabalho"
- **Then** the system MUST invoke `confirmActivity` API endpoint
- **And** upon success, the confirmation count MUST increment by 1, `user_has_confirmed` MUST be set to true, and the UI MUST update immediately.

#### Scenario: Handling confirmation RPC errors
- **Given** an API call to `confirmActivity` returns an explicit error or `{ success: false }`
- **When** the frontend processes the response
- **Then** an error snackbar MUST be displayed to the user explaining the issue
- **And** the confirmation button MUST re-enable without inconsistent UI state.
