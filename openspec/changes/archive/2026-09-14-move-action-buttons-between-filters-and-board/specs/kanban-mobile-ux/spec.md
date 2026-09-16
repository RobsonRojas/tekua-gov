# Capability: Work Wall Layout & Action Toolbar Position

## Requirements

### Requirement: Position Action Buttons Between Filters and Task Board
Primary action controls ("+ Criar Demanda", "+ Registrar Trabalho", "Atualizar") MUST be rendered in a dedicated toolbar positioned between the filter controls and the Kanban board columns.

#### Scenario: Rendering action buttons on the Work Wall
- **Given** a user viewing the Work Wall page
- **When** the layout is displayed
- **Then** the action buttons MUST be located below the `<WorkFilters />` component and above the Kanban columns
- **And** the top header bar MUST render only the page title and subtitle.
