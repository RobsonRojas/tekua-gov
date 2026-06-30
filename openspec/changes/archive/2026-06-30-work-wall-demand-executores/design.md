## Context

The Tekuá Gov platform recently introduced multi-executor capabilities for the "Work Registration" feature. The user now wants to bring this collaborative capability to the Work-Wall "Demands" feature. Currently, demands are assigned to a single executor. We need to allow multiple executors on a demand so that upon task completion, all assigned executors receive the established reward (surreais), and receive appropriate platform and email notifications.

## Goals / Non-Goals

**Goals:**
- Enable the selection of multiple executors when creating a demand on the Work-Wall.
- Automate the distribution of the demand's reward amount (surreais) to *all* assigned executors when the demand is confirmed as completed.
- Generate and send both in-app notifications and emails (containing a link to the demand) to all assigned executors upon creation/confirmation.
- Re-use the existing `Autocomplete` multi-select UI component utilized in work registration.

**Non-Goals:**
- Splitting the reward proportionally among executors (the requirement states all executors get the reward, similar to work registration).
- Complex task delegation hierarchies or sub-tasks.

## Decisions

- **Database Changes**: Update the underlying table for demands (likely `tasks` or a specific `demands` table) to replace the single `executor_id` field with an `executor_ids` array, aligning with the pattern established for work registration. 
- **Reward Distribution**: Modify the backend logic (likely in an Edge Function or Supabase RPC such as `submit_activity` or similar demand completion logic) to iterate over the `executor_ids` array, ensuring each user receives the full defined reward amount in surreais.
- **Notifications**: Integrate with the existing notification and email service. The edge function will loop through `executor_ids` and dispatch notification/email payloads for each user, ensuring they contain the deep link to the relevant demand.
- **Frontend UI**: Update the `CreateDemand` component to use a multi-select Autocomplete component for the executors field, matching the design established in `RegisterWork`. The `TaskDetail` and `ActivityCard` components will also need updates to display an array of executor avatars/profiles rather than a single one.

## Risks / Trade-offs

- **Risk**: Database migrations from `executor_id` to `executor_ids` might cause breaking changes in existing queries or frontend components that assume a single executor. 
  - **Mitigation**: Perform a thorough codebase search for `executor_id` and ensure backwards compatibility or complete migration of all related components (e.g., dashboard, task lists). Use array containment operators (`@>`) in PostgreSQL for filtering.
- **Risk**: Reward inflation. Crediting the full amount to *all* executors might inflate the economy if not monitored.
  - **Mitigation**: This is accepted as it mirrors the work registration behavior, but we will ensure the UI clearly indicates that *each* user will receive the full amount to prevent confusion.
