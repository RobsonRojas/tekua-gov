## Context

Currently, the system only allows the explicit beneficiary (requester) of a task to confirm it when the validation method is `requester_approval`. Sometimes, beneficiaries are unable to access the system to confirm a task in a timely manner. To avoid blocking the task completion and reward payout, system administrators need the ability to also confirm these tasks.

## Goals / Non-Goals

**Goals:**
- Allow system administrators to confirm tasks that are awaiting `requester_approval`.
- Update the frontend UI to display the "Confirm" button to administrators even when they are not the assigned beneficiary.
- Ensure the backend RPC `confirm_activity` properly authenticates administrators and allows the operation.

**Non-Goals:**
- Allowing any random user to confirm the task.
- Modifying how `community_consensus` validation works.

## Decisions

**1. Role-based check on Frontend**
The Work Wall UI (likely in the task detail or activity card component) will evaluate if the current user is the `requester_id` OR if the current user has an `admin` role. If either is true, the "Confirm" action will be available.

**2. Backend RPC update**
The `confirm_activity` RPC in the database will be updated. In the authorization checks, it will allow the confirmation if the caller's user ID matches the `requester_id` OR if the caller possesses administrator privileges (e.g., checking `is_admin()` or the user's role).

## Risks / Trade-offs

- **Risk:** An administrator might confirm a task without the beneficiary's consent, leading to disputes.
  - *Mitigation:* Administrators are trusted entities. Actions are auditable since the confirmation record will store the ID of the user who confirmed it (the admin).
