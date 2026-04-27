## Why

The Contribution Reports page currently displays technical translation keys (e.g., `admin.exportCSV`) instead of localized labels, making it difficult for administrators to use the platform effectively. Furthermore, the charts' visual presentation is compromised by overlapping legends and poor label positioning.

## What Changes

- **Localization Fixes**: Map and implement all missing translation keys for buttons, filters, chart titles, and table headers on the Contribution Reports page.
- **UI/UX Polishing**: Improve the layout of chart legends to ensure they are readable and do not overlap with other visual elements.
- **Table Header Cleanup**: Ensure all data table columns display human-readable, localized headers.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `i18n-interface`: Update requirements to include missing keys for administrative reports and dashboards.
- `reporting-visualizations`: Update requirements to ensure charts are accessible and legends are positioned logically without overlapping.

## Impact

- **i18n files**: `pt-BR.json` and `en-US.json` will be updated.
- **Admin Components**: Components responsible for the Contribution Reports dashboard.
- **Chart Components**: Visualization logic for legends and titles.
