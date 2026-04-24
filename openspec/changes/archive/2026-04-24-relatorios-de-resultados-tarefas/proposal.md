## Why

As the Tekuá governance system grows, community members and administrators need a transparent way to analyze contribution data. Currently, there is no easy-to-use interface to filter contributions, visualize trends, or export data for external audits. Providing these tools strengthens community trust and enables data-driven decision-making regarding resource allocation and member participation.

## What Changes

- **New Reporting Interface**: A dedicated dashboard page for members to query and filter contribution data.
- **Data Filtering**: Advanced filters for status, date range, contributor, and amount.
- **CSV Export**: A button to download the currently filtered view as a `.csv` file.
- **Dynamic Charts**: Interactive bar and pie charts that update based on selected table columns and filters.
- **Access Control**: The dashboard will be public to all logged-in members but restricted from non-authenticated users.

## Capabilities

### New Capabilities
- `contribution-reports`: A comprehensive interface for querying, filtering, and displaying contribution records in a tabular format.
- `data-export-service`: A utility to transform filtered table data into downloadable CSV files.
- `reporting-visualizations`: A set of dynamic UI components (bar and pie charts) that visualize contribution statistics based on user-selected metrics.

### Modified Capabilities
- None.

## Impact

- **UI**: New dashboard route `/dashboard/reports` (or similar).
- **Backend**: New Supabase queries optimized for reporting and aggregation.
- **Dependencies**: Addition of a charting library (e.g., Recharts or Chart.js) and a CSV generation utility.
- **Auth**: Updates to middleware or page-level checks to ensure only logged-in members can access the reports.
