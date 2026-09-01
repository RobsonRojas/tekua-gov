# Capability: Column Width & Unclipped Layout

## Requirements

### Requirement: Comfortable Kanban Column Width
Kanban columns MUST maintain a minimum width of at least 300px to ensure activity cards and action buttons do not squeeze or wrap unnaturally.

#### Scenario: Rendering Kanban columns
- **Given** a user is viewing the Work Wall
- **When** the columns are rendered
- **Then** each column MUST have a width of at least 300px (desktop default: 320px)
- **And** card titles, badges, and action buttons MUST remain fully legible without clipping.

---

### Requirement: Horizontal Board Navigation
The board container MUST support clean horizontal scrolling without clipping the left-most or right-most columns.

#### Scenario: Navigating all board columns
- **Given** 5 columns are rendered on screen
- **When** the total width exceeds the screen width
- **Then** horizontal scrolling MUST allow smooth scrolling across all columns
- **And** outer container padding MUST prevent edge clipping.
