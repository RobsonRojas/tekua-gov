# Tasks: Always-Visible Executor Filter

## Implementation Tasks

- [x] **1. Add i18n Translation Keys (`src/locales/pt/translation.json`, `src/locales/en/translation.json`)** <!-- id: 1 -->
  - Add `executor` key under `work` in translation files (`"executor": "Executor"`).

- [x] **2. Promote Executor Filter to Persistent Bar (`src/components/WorkFilters.tsx`)** <!-- id: 2 -->
  - Move the `workerId` dropdown filter from the `<Collapse>` section to the top persistent `<Box>` alongside the `projectId` filter.
  - Keep secondary filters (`requesterId`, `type`) inside the collapsible container.

- [x] **3. Build & Verification** <!-- id: 3 -->
  - Test filtering activities by Executor on the Work Wall.
  - Run `npm run build` to confirm 0 compilation errors.
