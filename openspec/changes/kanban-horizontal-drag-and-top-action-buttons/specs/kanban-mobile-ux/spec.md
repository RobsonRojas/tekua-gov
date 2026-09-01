# Capability: Kanban Horizontal Drag & Top Action Buttons

## Requirements

### Requirement: Mouse Drag-to-Scroll & Horizontal Navigation
The Work Wall board container MUST allow users to scroll horizontally either by mouse click-and-drag, touch swipe, shift-wheel, or single-tap column pill navigation.

#### Scenario: Dragging mouse across Kanban board container
- **Given** a user viewing the Work Wall on any device or emulator
- **When** clicking and dragging horizontally across the board container
- **Then** the container MUST scroll smoothly following the cursor drag movement
- **And** cursor styling MUST reflect active dragging state (`cursor: 'grabbing'`).

---

### Requirement: Action Buttons Above Task Board
Action buttons for creating demands and registering work MUST be rendered directly above the Kanban task board on mobile viewports.

#### Scenario: Viewing action buttons on mobile screen
- **Given** a mobile screen viewport (`xs`)
- **When** rendering the Work Wall page
- **Then** the "Criar Demanda" and "Registrar Trabalho" action buttons MUST be located right above the Kanban task columns
- **And** NO fixed floating action buttons MUST obscure or overlap task cards.
