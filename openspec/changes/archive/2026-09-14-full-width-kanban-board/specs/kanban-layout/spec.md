# Capability: Full Width Kanban Board Layout

## Requirements

### Requirement: Removal of Column Filter Pills
The Work Wall page MUST NOT render the column filter tab/pill selector menu.

#### Scenario: Displaying all columns simultaneously
- **Given** a user navigates to `/work-wall`
- **When** the page renders
- **Then** the column filter pill selector MUST be absent
- **And** all status columns (`Abertas`, `Em Execução`, `Para Validar`, `Concluídas`, and `Moderação`) MUST be rendered side-by-side simultaneously.

---

### Requirement: Full-Width Unconstrained Board Container
The Work Wall board MUST span 100% of the screen width without fixed `maxWidth` container constraints.

#### Scenario: Full-width board rendering
- **Given** a user is viewing the Work Wall on desktop or wide displays
- **When** the page loads
- **Then** the container MUST use full viewport width (`maxWidth={false}`)
- **And** all columns MUST adjust fluidly to prevent edge clipping.
