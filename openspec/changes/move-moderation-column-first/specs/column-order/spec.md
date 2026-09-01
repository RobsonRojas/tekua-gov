# Capability: Moderation Column Placement

## Requirements

### Requirement: First Column Positioning for Moderation
The "Moderação" column MUST be rendered as the very first column on the Kanban Work Wall, preceding the "Abertas" column.

#### Scenario: Displaying Kanban Columns
- **Given** an authorized user (admin or transversal council member) viewing the Work Wall
- **When** the Kanban board renders
- **Then** the "Moderação" column MUST appear first on the left, followed by "Abertas", "Em Execução", "Para Validar", and "Concluídas".
