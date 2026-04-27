## ADDED Requirements

### Requirement: Persistent Sidebar on Large Screens
The system SHALL display a persistent left-aligned sidebar for viewport widths greater than or equal to 900px (desktop/tablet).

#### Scenario: Display sidebar on desktop
- **WHEN** the viewport width is 1024px
- **THEN** a vertical sidebar is visible on the left side of the screen

### Requirement: Mini-Variant (Collapsible) Sidebar
The desktop sidebar SHALL support a "mini-variant" state where it collapses to show only icons, maximizing horizontal space for main content.

#### Scenario: Collapse sidebar
- **WHEN** the user clicks the "Collapse" button in the sidebar
- **THEN** the sidebar width decreases, showing only icons
- **THEN** the main content area expands to fill the newly available space

### Requirement: Responsive Mobile Navigation
For viewport widths less than 900px, the system SHALL hide the persistent sidebar and display a top header with a hamburger menu button.

#### Scenario: Open mobile menu
- **WHEN** the viewport width is 375px (mobile)
- **THEN** the sidebar is hidden
- **THEN** clicking the hamburger button opens a temporary navigation drawer

### Requirement: Profile and Logout Bottom Placement
The Profile link, Theme Toggle, Language Selector, and Logout button SHALL be positioned at the bottom of the navigation drawer (or sidebar), separate from the main feature links.

#### Scenario: Navigation links organization
- **WHEN** the navigation drawer is open
- **THEN** Dashboard, Wallet, and Mural links are at the top
- **THEN** Logout and Profile links are at the bottom

### Requirement: Remove Redundant Profile Link
The "Perfil" (Profile) link SHALL be removed from the primary list of navigation items as it is redundant with the dedicated profile access in the bottom section.

#### Scenario: Verify navigation list
- **WHEN** viewing the navigation menu
- **THEN** "Perfil" is NOT present in the main list of features
- **THEN** Profile access is available via the bottom avatar or settings area
