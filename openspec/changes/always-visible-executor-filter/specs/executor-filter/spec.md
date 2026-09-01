# Capability: Persistent Executor Filter

## Requirements

### Requirement: Always-Visible Executor Filter
The Executor filter MUST be rendered in the primary persistent filter bar without requiring users to open the collapsible filter menu.

#### Scenario: Filtering board by Executor
- **Given** a user is viewing the Work Wall
- **When** the page loads
- **Then** both the Project dropdown and Executor dropdown MUST be visible in the persistent top bar
- **And** selecting an executor MUST filter activities by `workerId` in real time.
