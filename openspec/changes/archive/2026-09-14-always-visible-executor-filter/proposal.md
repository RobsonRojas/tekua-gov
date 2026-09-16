# Proposal: Always-Visible Executor Filter

## Why

Currently, the Executor (`workerId`) dropdown filter is nested inside the collapsible "Mostrar Filtros" (Show Filters) section. Users frequently need to filter activities by who is executing them, requiring an extra click to expand secondary filters.

Making the Executor filter persistently visible alongside the Project filter in the top filter bar improves quick filtering efficiency and board usability.

## What

- **Promote Executor Filter to Top Persistent Bar**:
  - Move the Executor (`workerId`) dropdown filter to the top persistent bar next to the Project filter.
  - Maintain the remaining filters (`requesterId`, `type`) inside the collapsible secondary filter area.
  - Standardize labels using `work.executor` / `work.worker` ("Executor") across PT and EN i18n translation files.
