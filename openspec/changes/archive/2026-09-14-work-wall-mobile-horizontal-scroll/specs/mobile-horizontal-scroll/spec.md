# Capability: Mobile & PWA Horizontal Scroll & Column Accessibility

## Requirements

### Requirement: Horizontal Board Swiping on Mobile & PWA
The Work Wall board container MUST permit continuous horizontal scrolling and touch swiping across all columns on mobile viewports and PWA webviews.

#### Scenario: Swiping horizontally across board columns
- **Given** a user viewing the Work Wall on a mobile device or PWA app
- **When** swiping horizontally across the Kanban board container
- **Then** the container MUST scroll smoothly horizontally without trapping or stopping gesture movement
- **And** all 5 columns ("Moderação", "Abertas", "Em Execução", "Para Validar", "Concluídas") MUST be fully accessible.

---

### Requirement: Responsive Column Widths & Edge Peek Hint
Kanban columns MUST retain clear legibility while providing a visual scroll hint on mobile screens.

#### Scenario: Viewing board on mobile screen (<600px width)
- **Given** a screen width below 600px (`xs`)
- **When** the Kanban columns are rendered
- **Then** each column MUST occupy `82vw` (min 270px width) with `flexShrink: 0`
- **And** the adjacent column MUST partially peek from the screen edge to signal scrollability.

---

### Requirement: Direct Column Tap Navigation on Mobile
The Work Wall MUST provide quick-tap column indicators on mobile screens to jump directly to any column.

#### Scenario: Tapping a column in the mobile indicator bar
- **Given** a user viewing the Work Wall on a mobile viewport
- **When** the user taps a column indicator chip (e.g., "Em Execução")
- **Then** the Kanban board container MUST scroll horizontally to bring that target column into view.
