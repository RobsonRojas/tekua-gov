## ADDED Requirements

### Requirement: CSV Export Generation
The system SHALL provide a feature to export the currently filtered set of contribution data into a standard CSV (Comma-Separated Values) format.

#### Scenario: Successful CSV export
- **WHEN** the user clicks the "Export CSV" button
- **THEN** the system SHALL generate and trigger a download of a file named "contributions_report.csv" containing all currently filtered records

### Requirement: Export Data Integrity
The CSV export MUST include all visible table columns and preserve the data types (e.g., dates in ISO format, amounts as numbers).

#### Scenario: Verify CSV content
- **WHEN** the user opens the exported CSV file
- **THEN** the headers and row data MUST match the filtered results displayed in the UI table
