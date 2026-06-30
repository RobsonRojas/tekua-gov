## Why

The current work-wall demand system does not support assigning multiple executors to a single task, which limits collaboration on complex tasks. By allowing multiple executors, teams can share ownership of demands and have the rewards (surreais) credited to all participants upon completion, similar to how the recent work registration updates function.

## What Changes

- Modify the "Create Demand" interface on the work-wall to allow selecting multiple executors (using an Autocomplete component for members).
- Update the demand execution confirmation logic to credit the designated reward (surreais) to all added executors.
- Implement email and platform notifications for all assigned executors when a demand is created or their participation is confirmed, including a direct link to the demand.

## Capabilities

### New Capabilities
- `demand-multi-executors`: Allow assigning multiple executors to work-wall demands, automating reward distribution to all participants and generating appropriate notifications.

### Modified Capabilities
- `gift-economy-tasks`: Update requirements to handle arrays of executors instead of a single executor, and distribute rewards to all assigned users upon task completion.

## Impact

- **Database**: The `tasks` or `demands` table may need to support multiple executors (e.g., changing an `executor_id` to `executor_ids` array or using a join table).
- **Edge Functions / RPCs**: The functions handling demand creation and execution confirmation must iterate over the multiple executors to distribute rewards.
- **Frontend**: The `CreateDemand` form and `TaskDetail` / `ActivityCard` components will need to display and manage multiple executor profiles.
- **Notifications**: Notification and email services will be updated to send to multiple recipients when demands are created or updated.
