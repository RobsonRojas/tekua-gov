# Tasks: Implementar Vilage Beneficiary User

1) DB Migration
- Create migration to add `village_id` column to `profiles` (nullable, FK to villages table).
- Ensure `roles` array accepts `beneficiary` (no migration if roles is generic array).

2) Backend
- Update edge function `api-work:moderateActivity` to accept `beneficiary` role checks:
  - Load user's profile (including roles and village_id) from the authenticated JWT or DB.
  - If action is `confirm`/`approve` and activity.beneficiary_type === 'village' and user.roles includes `beneficiary` and activity.beneficiary_id === user.village_id, allow the action.
  - Return meaningful 403/400 messages when not authorized.
- Add unit tests for the new authorization case.

3) Frontend (Admin Panel)
- Update `MemberManagement` to allow assigning `beneficiary` role and selecting `village_id`.
  - Add a new MenuItem and UI flow in the member edit modal (`MemberEditModal`).
  - Ensure `MemberEditModal` sends updated roles and village_id to server via existing API.
- Show a Chip/badge for beneficiary users in `MemberManagement` and in `ActivityCard` (if user is beneficiary show `Beneficiário (Vila)` when relevant).

4) Frontend (Task confirmation)
- Ensure the `ActivityCard` `handleModeration` and `handleAction` paths surface API errors to users (already improved).

5) Audit & Logging
- Log role assignments and moderator actions in audit logs.

6) QA
- Manual testing: assign a beneficiary user and confirm a village task with that user.
- Integration tests for the workflow.

7) Deployment
- Deploy DB migration, backend changes, then frontend.

Notes
- Follow existing project patterns for APIs and migrations.
