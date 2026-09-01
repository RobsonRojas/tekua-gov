# Capability: Activity Card High Contrast Visual Design

## Requirements

### Requirement: Card Text Contrast & Legibility Compliance
All text elements inside `ActivityCard` MUST satisfy high contrast legibility standards against card surface backgrounds.

#### Scenario: Reading activity card content
- **Given** an activity card rendered in any Kanban column
- **When** a user reads card titles, descriptions, confirmation stats, or metadata
- **Then** text colors MUST provide high contrast (`rgba(255, 255, 255, 0.88)` for descriptions, `rgba(255, 255, 255, 0.8)` for metadata)
- **And** action buttons MUST use high-contrast filled background colors with solid white text (`#ffffff`).
