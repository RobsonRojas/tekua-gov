# Tasks - Fix Contribution Report Labels

- [ ] **1. Localization Updates**
    - [ ] 1.1 Add new keys to `src/locales/pt-BR.json` (`admin.reports`, `admin.exportCSV`, `admin.statusDistribution`, `admin.typeDistribution`, `admin.topContributors`, `admin.date`, `work.contributor`, `work.amount`, `admin.clear`, `admin.minAmount`, `admin.startDate`, `admin.endDate`).
    - [ ] 1.2 Add corresponding keys to `src/locales/en-US.json`.

- [ ] **2. UI Refactoring**
    - [ ] 2.1 Update `src/pages/Dashboard/Reports/index.tsx` to use `t('admin.reports')` for the title.
    - [ ] 2.2 Update `ReportFilters.tsx` to internationalize button labels and date picker labels.
    - [ ] 2.3 Update `ReportingCharts.tsx` to internationalize chart titles.
    - [ ] 2.4 Update `ContributionTable.tsx` to internationalize table headers.

- [ ] **3. Chart Polish**
    - [ ] 3.1 Update `ReportingCharts.tsx` to position legends at the bottom with proper padding (min 20px).

- [ ] **4. Verification**
    - [ ] 4.1 Verify in the browser that all labels are correctly translated in both PT and EN.
    - [ ] 4.2 Verify that chart legends no longer overlap with chart elements.
