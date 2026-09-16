# Capability: Kanban Header & Right Column Visibility

## Requirements

### Requirement: Header Action Button Overflow Prevention
Header action buttons ("+ Registrar Trabalho", "+ Criar Demanda", "Atualizar") MUST remain fully visible within screen boundaries without clipping.

#### Scenario: Header rendering on desktop and laptop screens
- **Given** a user on a laptop or desktop screen (1280px - 1440px width)
- **When** the header bar renders top action buttons
- **Then** button text and icons MUST fit within the viewport bounds without right edge clipping
- **And** the header container MUST wrap or scale buttons gracefully when width is constrained.

---

### Requirement: Trailing Column Visibility & End Padding
The rightmost Kanban column ("Concluída") MUST render completely with visible outer margin and end padding.

#### Scenario: Viewing trailing column "Concluída"
- **Given** the 5-column Work Wall board
- **When** a user views or scrolls to the "Concluída" column
- **Then** the entire column Paper, border, and cards MUST remain visible without right edge truncation
- **And** the board scroll container MUST provide right end padding (`pr`).
