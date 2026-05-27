## Context

When a task or contribution is submitted, its status defaults to `pending_approval`. The Transversal Council must moderate (approve/reject) these activities. However, in the `WorkWall` interface, the "Todos" (All) tab currently displays all raw activities fetched from the backend, which means standard users can see `pending_approval` tasks before they are officially approved by the Council. 

## Goals / Non-Goals

**Goals:**
- Ensure that standard users cannot see `pending_approval` activities in the Work Wall, including the "Todos" tab.
- Maintain visibility of `pending_approval` tasks for members of the Transversal Council and Admins so they can moderate them.

**Non-Goals:**
- Changing the moderation flow itself.

## Decisions

- **Backend Filtering vs Frontend Filtering:** We will implement the filtering primarily on the backend in the `fetchActivities` action of `api-work`. We will check if the user has `admin` or `transversal_council` roles. If they do not, we will add a filter to exclude `status = 'pending_approval'`. This is more secure than frontend filtering.
- **Frontend Fallback:** In `WorkWall.tsx`, we will also ensure the "Todos" tab explicitly excludes `pending_approval` and `rejected` statuses for standard users, as an extra layer of clarity.

## Risks / Trade-offs

- **Risk:** Standard users who created a task might not see their own pending tasks in the "Todos" tab.
  - **Mitigation:** We can allow the `fetchActivities` endpoint to return `pending_approval` tasks *if* the `requester_id` matches the current user. This way, users can see their own pending demands.
