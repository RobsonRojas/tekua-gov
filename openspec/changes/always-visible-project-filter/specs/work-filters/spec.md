# Capability: Work Filters Layout

## Requirements

### Requirement: Always-Visible Project Filter
The Work Wall filters component (`WorkFilters.tsx`) MUST keep the Project filter selector permanently visible outside the collapsed section.

#### Scenario: Viewing default filter bar
- **Given** a user navigates to the Work Wall (`/work-wall`)
- **When** the page loads and filters are in their default collapsed state
- **Then** the Project filter selector MUST be visible and usable without expanding secondary filters.

#### Scenario: Expanding secondary filters
- **Given** the user is viewing the Work Wall filter bar
- **When** the user clicks "Mostrar Filtros"
- **Then** the secondary filters (`Solicitante`, `Membro Executor`, `Tipo`) MUST expand into view
- **And** the Project filter MUST remain visible in its permanent position.

#### Scenario: Correct label translation
- **Given** any locale setting (PT or EN)
- **When** rendering the Project filter label
- **Then** it MUST render as "Projeto" (in PT) or "Project" (in EN) instead of raw key `work.project`.
