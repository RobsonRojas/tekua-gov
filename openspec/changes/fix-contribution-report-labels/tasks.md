# Tasks - Fix Contribution Report Labels

- [x] **1. Localization Updates**
    - [x] 1.1 Add new keys to `src/locales/pt-BR.json` (`admin.reports`, `admin.exportCSV`, `admin.statusDistribution`, `admin.typeDistribution`, `admin.topContributors`, `admin.date`, `work.contributor`, `work.amount`, `admin.clear`, `admin.minAmount`, `admin.startDate`, `admin.endDate`).
    - [x] 1.2 Add corresponding keys to `src/locales/en-US.json`.

- [x] **2. UI Refactoring**
    - [x] 2.1 Update `src/pages/Dashboard/Reports/index.tsx` to use `t('admin.reports')` for the title.
    - [x] 2.2 Update `ReportFilters.tsx` to internationalize button labels and date picker labels.
    - [x] 2.3 Update `ReportingCharts.tsx` to internationalize chart titles.
    - [x] 2.4 Update `ContributionTable.tsx` to internationalize table headers.

- [x] **3. Chart Polish**
    - [x] 3.1 Update `ReportingCharts.tsx` to position legends at the bottom with proper padding (min 20px).

- [x] **4. Verification**
    - [x] 4.1 Verify in the browser that all labels are correctly translated in both PT and EN.
    - [x] 4.2 Verify that chart legends no longer overlap with chart elements.
