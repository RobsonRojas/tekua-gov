# Capability: Work Wall Header Action Button Right Margin & No Clipping

## Requirements

### Requirement: Right Edge Safety Margin & Complete Visibility
Header action buttons ("+ Registrar Trabalho", "+ Criar Demanda", "Atualizar") MUST render completely within the viewport bounds with a visible right safety margin and ZERO text clipping on all screen sizes.

#### Scenario: Header rendering on desktop and laptop screens
- **Given** a user viewing the Work Wall on desktop or laptop
- **When** top action buttons render in the header row
- **Then** the label "+ Registrar Trabalho" MUST display in full with at least 16px safety margin from the right viewport/container edge
- **And** no part of the button border or text MAY be clipped by the edge of the screen.
