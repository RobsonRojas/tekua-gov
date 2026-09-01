# Capability: Work Wall Header Action Button Full Visibility

## Requirements

### Requirement: Full Visibility of Header Action Button Text
Header action buttons ("+ Registrar Trabalho", "+ Criar Demanda", "Atualizar") MUST display their complete label text without truncation or edge clipping on all screen sizes.

#### Scenario: Header rendering on desktop and laptop screens
- **Given** a user viewing the Work Wall on desktop or laptop (1280px–1440px width with sidebar open)
- **When** top action buttons render in the header row
- **Then** the label "+ Registrar Trabalho" MUST display in full without truncation ("+ Registrar Traba") or right edge clipping
- **And** the button group MUST wrap or scale responsively when horizontal width is restricted.
