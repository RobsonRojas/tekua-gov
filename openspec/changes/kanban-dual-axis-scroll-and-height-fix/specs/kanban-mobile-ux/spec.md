# Capability: Kanban Dual-Axis Scroll & Viewport Fit

## Requirements

### Requirement: Viewport Height Bounded Columns & Vertical Scroll
Kanban board columns MUST fit inside screen viewport height bounds and allow independent vertical card list scrolling.

#### Scenario: Column containing many activity cards
- **Given** a Kanban column with 10+ activity cards
- **When** rendering on desktop or mobile viewports
- **Then** the column height MUST be bounded within `calc(100vh - 230px)` on desktop and `calc(100vh - 210px)` on mobile
- **And** the inner card list MUST provide independent vertical scrolling (`overflowY: 'auto'`) with custom scrollbar styling.

---

### Requirement: Dual-Axis Board Navigation
The Work Wall board MUST allow seamless horizontal navigation across columns and vertical scrolling inside columns on desktop and mobile browsers.

#### Scenario: Swiping or scrolling on dual-axis container
- **Given** a user viewing the Work Wall board
- **When** scrolling horizontally or vertically using mouse, trackpad, touch gesture, or navigation pills/chevrons
- **Then** both scroll axes MUST respond smoothly without gesture conflicts or content clipping.
