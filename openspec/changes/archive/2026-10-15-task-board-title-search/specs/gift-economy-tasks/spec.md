## ADDED Requirements

### Requirement: Task Title Visible on Board
The system SHALL display the title of each task on its card in the tasks board.

#### Scenario: Viewing the tasks board
- **WHEN** a user views the tasks board
- **THEN** each task card SHALL show the task's title

### Requirement: Task Search Field on Board
The system SHALL provide a text search field on the tasks board that filters tasks by title (and/or description) in addition to the existing filters.

#### Scenario: Searching by title
- **WHEN** a user types text into the search field
- **THEN** the board SHALL show only tasks whose title or description matches the search text

#### Scenario: Clearing the search
- **WHEN** the user clears the search field
- **THEN** the board SHALL show all tasks allowed by the active filters
