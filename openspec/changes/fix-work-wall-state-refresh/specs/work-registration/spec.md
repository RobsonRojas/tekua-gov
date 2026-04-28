## ADDED Requirements

### Requirement: Responsive Activity Updates
The Mural de Trabalho SHALL provide immediate visual feedback when an activity status changes, ensuring that the user's local state is synchronized with the backend confirmation.

#### Scenario: Immediate Feedback on Taking a Task
- **WHEN** a user clicks "Assumir Tarefa" on an open activity.
- **THEN** the system SHALL immediately update the card's status to "Em Execução" upon successful API confirmation, without requiring a manual page refresh.
