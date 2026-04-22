## ADDED Requirements

### Requirement: Interactive Bar Charts
The system SHALL provide interactive bar charts that visualize contribution metrics (e.g., total amount by contributor or count by status).

#### Scenario: Update chart based on filter
- **WHEN** the user applies a status filter
- **THEN** the bar chart SHALL automatically update to reflect the distribution of the filtered data

### Requirement: Interactive Pie Charts
The system SHALL provide interactive pie charts to show proportional distributions of selected categories.

#### Scenario: Switch chart metric
- **WHEN** the user selects a different metric for the pie chart (e.g., "Status Distribution")
- **THEN** the pie chart SHALL re-render showing the percentage breakdown of each status category

### Requirement: Visualization Column Selection
The system SHALL allow users to select which table columns to use as dimensions or metrics for the charts.

#### Scenario: Select chart column
- **WHEN** the user selects the "Contributor" column for the X-axis of a bar chart
- **THEN** the chart SHALL group and sum contribution amounts by contributor name
