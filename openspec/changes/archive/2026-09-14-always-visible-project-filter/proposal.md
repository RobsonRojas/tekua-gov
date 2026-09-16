# Proposal: Always-Visible Project Filter on Work Wall

## Why

Currently, all task filter controls (`Solicitante`, `Membro`, `Tipo`, `Projeto`) in `WorkFilters.tsx` are hidden inside a collapsible container, requiring users to click "Mostrar Filtros" to filter tasks by project. Furthermore, project context is the primary dimension users filter activities by.

Additionally, the project filter input label displayed the raw translation key `work.project` instead of proper fallback text "Projeto".

## What

- **Always-Visible Project Filter**:
  - Extract the Project filter dropdown (`Projeto`) out of the collapsed area so it remains permanently visible on the top filter bar.
  - Position the Project selector alongside the "Mostrar Filtros" button and "Limpar" button.

- **Collapsible Secondary Filters**:
  - Keep secondary filters (`Solicitante`, `Membro Executor`, `Tipo`) hidden inside the expandable section, revealed only when clicking "Mostrar Filtros".

- **Translation & Label Polish**:
  - Update `WorkFilters.tsx` and i18n translation files to display "Projeto" / "Project" cleanly instead of `work.project`.
