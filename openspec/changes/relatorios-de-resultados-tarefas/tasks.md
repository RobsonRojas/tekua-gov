## 1. Setup & Dependencies

- [x] 1.1 Install `recharts` library for data visualization
- [x] 1.2 Create the directory structure for the new dashboard components in `src/pages/Dashboard/Reports`
- [x] 1.3 Register the new route `/dashboard/reports` in the application router

## 2. Backend & Data Fetching

- [x] 2.1 Create a `useContributionReports` hook to encapsulate data fetching from Supabase
- [x] 2.2 Implement dynamic filtering logic within the hook using query parameters
- [x] 2.3 Verify RLS policies on `contributions` table allow authenticated members to read necessary reporting fields

## 3. UI Components & Filtering

- [x] 3.1 Build the `ReportFilters` component with inputs for status, date range, contributor, and amount
- [x] 3.2 Implement URL-based state management for filter values using `useSearchParams`
- [x] 3.3 Create a `ContributionTable` component to display the filtered records with responsive styling

## 4. Data Export Implementation

- [x] 4.1 Implement a `downloadCSV` utility function to convert JSON data to CSV format
- [x] 4.2 Add an "Export CSV" button to the dashboard that triggers the download of the currently filtered view

## 5. Visualizations & Charts

- [x] 5.1 Implement a `ReportingCharts` container component to host the bar and pie charts
- [x] 5.2 Build the `StatusDistributionChart` (Pie) to show contribution counts by status
- [x] 5.3 Build the `AmountByContributorChart` (Bar) to show total amounts per member
- [x] 5.4 Add logic to allow users to toggle between different visualization metrics

## 6. Final Integration & Testing

- [x] 6.1 Integrate all components into the main `ReportsDashboard` page
- [x] 6.2 Implement access control checks to ensure only logged-in members can view the page
- [x] 6.3 Perform manual verification of filters, charts, and CSV export functionality
- [x] 6.4 Write unit tests for the CSV utility and data fetching logic

## 7. Refactor to Unified Activities Framework

- [x] 7.1 Update `useContributionReports` hook to query the `activities` table instead of `contributions`
- [x] 7.2 Map legacy field names (`amount_suggested` -> `reward_amount`) and handle i18n JSONB fields in reports
- [x] 7.3 Update filters to include `type` (Task vs Contribution) and adapt status mapping
- [x] 7.4 Verify that charts and CSV export correctly process the new activity data format
- [x] 7.5 Rename components and hooks to reflect the broader "Activities" scope if appropriate


