## Context

The Governance Configuration tab in the Admin Panel includes a setting for "Threshold de Validação" (validation_threshold). This value is supposed to dictate how many confirmations a task needs before it can be automatically validated and paid out. However, currently, changes to this input are either not being saved to the `governance_settings` table properly, or the task creation endpoint (`api-work`) is not reading this value, defaulting to a hardcoded number.

## Goals / Non-Goals

**Goals:**
- Ensure the Admin Panel's `GovernanceServices.tsx` (or related configuration component) correctly saves the validation threshold to the backend.
- Ensure the `api-work` edge function (or task creation logic) queries the global `validation_threshold` from `governance_settings` and applies it as `min_confirmations` to new activities.

**Non-Goals:**
- Redesigning the governance model.
- Applying retro-active threshold changes to existing, already-created tasks.

## Decisions

- **Admin Config Update:** The `api-governance` endpoint must accurately process the `validation_threshold` parameter and store it. The frontend `GovernanceServices.tsx` or related component must send the numeric value correctly.
- **Task Creation Update:** In `api-work/index.ts` (the `createActivity` action), we will query the current active `governance_settings`. If a `validation_threshold` exists, we will use it for `min_confirmations`; otherwise, we fallback to the default (e.g., 3).

## Risks / Trade-offs

- **Risk:** High latency if `governance_settings` is queried on every single task creation.
  - **Mitigation:** Querying a single row from `governance_settings` adds negligible overhead compared to the task creation itself. We won't add complex caching since this is low-frequency.
