# Tasks: Implementar Vilage Beneficiary User

- [x] DB Migration: add `village_id` column to `profiles` (nullable, FK to villages table), ensure `roles` array accepts `beneficiary`
- [x] Backend: update `api-work:moderateActivity` to accept `beneficiary` role checks (load profile, validate village match, return errors)
- [x] Backend: add E2E test for the new beneficiary authorization case
- [x] Frontend (Admin Panel): update `MemberManagement`/`MemberEditModal` to allow assigning `beneficiary` role and selecting `village_id`
- [x] Frontend (Admin Panel): show Chip/badge for beneficiary users in `MemberManagement` and `ActivityCard`
- [x] Audit & Logging: log role assignments and moderator actions
- [ ] QA & Deployment: manual testing, integration tests, deploy migration/backend/frontend
