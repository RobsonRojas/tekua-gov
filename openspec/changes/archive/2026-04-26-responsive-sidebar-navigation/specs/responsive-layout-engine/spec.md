## ADDED Requirements

### Requirement: Standard Layout Breakpoints
The system SHALL define and use a consistent set of breakpoints for layout adaptations:
- **Mobile**: < 600px
- **Tablet**: 600px - 900px
- **Desktop**: > 900px

#### Scenario: Verify tablet breakpoint
- **WHEN** viewport width is 768px
- **THEN** the system identifies the device as "tablet"
- **THEN** layout adjustments specific to tablet view are applied (e.g., persistent sidebar)

### Requirement: Content Area Auto-Adjustment
The main content container SHALL dynamically adjust its margins and padding based on the current sidebar state (expanded, collapsed, or hidden).

#### Scenario: Content shift on sidebar collapse
- **WHEN** the desktop sidebar is toggled from expanded (240px) to collapsed (64px)
- **THEN** the main content area smoothly transitions its left margin to 64px

### Requirement: Mobile Header Visibility
On viewports < 900px, a simplified top header SHALL be visible to provide access to the hamburger menu and notifications.

#### Scenario: Header visibility on mobile
- **WHEN** viewport width is 375px
- **THEN** the top header is visible
- **THEN** the header contains the "TEKUA" logo, notification icon, and hamburger menu icon
