# Capability: Kanban Horizontal Scroll & Full Column Visibility

## Requirements

### Requirement: Full Horizontal Scrollability for All 5 Columns
The Kanban board container MUST allow smooth horizontal scrolling on desktop, tablet, and mobile, ensuring all 5 columns ("Moderação", "Aberta", "Em Execução", "Para Validar", "Concluída") remain fully accessible.

#### Scenario: User scrolling to rightmost columns on desktop/laptop
- **Given** a user viewing the Work Wall on desktop or laptop
- **When** the user scrolls horizontally (via scrollbar, mouse drag, wheel, or column navigation pills)
- **Then** the rightmost columns ("Para Validar", "Concluída") MUST scroll smoothly into full view
- **And** column widths MUST remain consistent (`flex: '0 0 280px'`) without shrinking or squishing content.
