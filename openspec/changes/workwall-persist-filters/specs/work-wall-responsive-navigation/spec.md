## ADDED Requirements

### Requirement: Work Wall Filter Persistence
The system SHALL persist the filters applied by the user on the work wall in `localStorage`, and SHALL restore and apply them automatically whenever the work wall loads.

#### Scenario: Filters persist across reload
- **WHEN** a user applies filters on the work wall and reloads the page
- **THEN** the same filters SHALL be loaded from `localStorage` and applied to the displayed items

#### Scenario: Default state without saved filters
- **WHEN** the user loads the work wall for the first time (no saved filters)
- **THEN** the board SHALL behave with default (no filters)

### Requirement: Active Filters Indicator
The system SHALL clearly indicate in the UI when filters are currently applied on the work wall.

#### Scenario: Filtros aplicados evidenciados
- **WHEN** at least one filter is active (different from the default)
- **THEN** the UI SHALL show a visible indicator (e.g., badge with count or highlighted filter state)

#### Scenario: Nenhum filtro ativo
- **WHEN** all filters are in their default state
- **THEN** the active-filters indicator SHALL NOT be shown
