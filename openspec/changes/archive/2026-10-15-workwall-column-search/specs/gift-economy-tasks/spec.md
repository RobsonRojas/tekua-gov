## ADDED Requirements

### Requirement: Work Wall Column Search
The system SHALL provide a search input in each column of the work wall that filters the items of that column by name (task/demand title).

#### Scenario: Searching within a column
- **WHEN** a user types text into the search field of a specific column
- **THEN** only items of that column whose title matches the search text SHALL be displayed

#### Scenario: Clearing the column search
- **WHEN** the user clears the search field of a column
- **THEN** all items of that column SHALL be displayed again
