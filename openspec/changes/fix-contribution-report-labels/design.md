# Design - Fix Contribution Report Labels

## Context
The Contribution Reports page is showing translation keys instead of labels. The charts also have overlapping legends.

## Decisions

### 1. Translation Mapping
We will add the following keys to `src/locales/pt-BR.json` and `src/locales/en-US.json`:
- `admin.reports`: "Relatórios de Contribuições" / "Contribution Reports"
- `admin.exportCSV`: "Exportar CSV" / "Export CSV"
- `admin.clear`: "Limpar" / "Clear"
- `admin.statusDistribution`: "Distribuição por Status" / "Status Distribution"
- `admin.typeDistribution`: "Distribuição por Tipo" / "Type Distribution"
- `admin.topContributors`: "Maiores Contribuidores" / "Top Contributors"
- `admin.date`: "Data" / "Date"
- `work.contributor`: "Contribuidor" / "Contributor"
- `work.amount`: "Valor" / "Amount"
- `admin.minAmount`: "Valor Mínimo" / "Min Amount"
- `admin.startDate`: "Data Início" / "Start Date"
- `admin.endDate`: "Data Fim" / "End Date"

### 2. Chart Legend Positioning
In `src/pages/Dashboard/Reports/components/ReportingCharts.tsx`, we will update the Recharts `Legend` component:
- Set `verticalAlign="bottom"`.
- Set `align="center"`.
- Add `wrapperStyle={{ paddingTop: '24px' }}` to ensure separation from the chart area.

### 3. Component Updates
All components in `src/pages/Dashboard/Reports/components/` will be updated to use the `useTranslation` hook for all visible strings.
