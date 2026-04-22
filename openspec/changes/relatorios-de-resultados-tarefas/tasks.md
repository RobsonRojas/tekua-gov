## 1. Setup & Dependencies

- [ ] 1.1 Install `recharts` library for data visualization
- [ ] 1.2 Create the directory structure for the new dashboard components in `src/pages/Dashboard/Reports`
- [ ] 1.3 Register the new route `/dashboard/reports` in the application router

## 2. Backend & Data Fetching

- [ ] 2.1 Create a `useContributionReports` hook to encapsulate data fetching from Supabase
- [ ] 2.2 Implement dynamic filtering logic within the hook using query parameters
- [ ] 2.3 Verify RLS policies on `contributions` table allow authenticated members to read necessary reporting fields

## 3. UI Components & Filtering

- [ ] 3.1 Build the `ReportFilters` component with inputs for status, date range, contributor, and amount
- [ ] 3.2 Implement URL-based state management for filter values using `useSearchParams`
- [ ] 3.3 Create a `ContributionTable` component to display the filtered records with responsive styling

## 4. Data Export Implementation

- [ ] 4.1 Implement a `downloadCSV` utility function to convert JSON data to CSV format
- [ ] 4.2 Add an "Export CSV" button to the dashboard that triggers the download of the currently filtered view

## 5. Visualizations & Charts

- [ ] 5.1 Implement a `ReportingCharts` container component to host the bar and pie charts
- [ ] 5.2 Build the `StatusDistributionChart` (Pie) to show contribution counts by status
- [ ] 5.3 Build the `AmountByContributorChart` (Bar) to show total amounts per member
- [ ] 5.4 Add logic to allow users to toggle between different visualization metrics

## 6. Final Integration & Testing

- [ ] 6.1 Integrate all components into the main `ReportsDashboard` page
- [ ] 6.2 Implement access control checks to ensure only logged-in members can view the page
- [ ] 6.3 Perform manual verification of filters, charts, and CSV export functionality
- [ ] 6.4 Write unit tests for the CSV utility and data fetching logic
