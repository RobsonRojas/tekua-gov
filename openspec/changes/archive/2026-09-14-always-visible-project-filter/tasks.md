# Tasks: Always-Visible Project Filter

## Implementation Tasks

- [x] **1. Extract Project Filter to Top Level Bar (`src/components/WorkFilters.tsx`)** <!-- id: 1 -->
  - Move the `projectId` Select control out of the `<Collapse>` container into the top persistent row.
  - Position Project filter alongside "Mostrar Filtros" and "Limpar" buttons.

- [x] **2. Keep Secondary Filters Collapsible (`src/components/WorkFilters.tsx`)** <!-- id: 2 -->
  - Retain `requesterId`, `workerId`, and `type` inside `<Collapse in={expanded}>`.
  - Adjust grid layouts for clean rendering on both mobile and desktop screens.

- [x] **3. Update i18n Translations and Label Fallbacks** <!-- id: 3 -->
  - Add/Verify `"project": "Projeto"` under `"work"` section in `pt/translation.json`.
  - Add/Verify `"project": "Project"` under `"work"` section in `en/translation.json`.
  - Use `t('work.project', 'Projeto')` fallback in `WorkFilters.tsx`.

- [x] **4. Build & Verification** <!-- id: 4 -->
  - Verify layout responsiveness and filter behavior.
  - Run `npm run build` to ensure 0 compilation errors.
