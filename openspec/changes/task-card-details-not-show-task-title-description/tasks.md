## 1. Fix Task Registration Bug

- [ ] 1.1 Update `src/pages/RegisterWork.tsx` to send the full `submissionData.p_description` object in the `api-work` invocation.
- [ ] 1.2 Verify that new tasks are correctly stored with JSONB descriptions in the database.
- [ ] 1.3 Create a SQL migration to wrap existing string descriptions in the `activities` table into i18n objects.

## 2. Backend Infrastructure for Interactions

- [ ] 2.1 Create a migration to add the `activity_interactions` table with fields for `activity_id`, `user_id`, `content`, `metadata`, and `created_at`.
- [ ] 2.2 Add RLS policies to `activity_interactions` to allow authenticated users to read and post comments.
- [ ] 2.3 Update the `api-work` Edge Function to include the `fetchInteractions` action.
- [ ] 2.4 Update the `api-work` Edge Function to include the `postInteraction` action.

## 3. Frontend Implementation of Interactions

- [ ] 3.1 Add translation keys for task interactions (e.g., `work.interactions`, `work.postComment`, `work.askQuestion`).
- [ ] 3.2 Implement the `TaskInteractions` component with a list of messages and a post form.
- [ ] 3.3 Integrate `TaskInteractions` into the `TaskDetail.tsx` page layout.
- [ ] 3.4 Add logic to refresh the interaction history after a successful submission.

## 4. Verification

- [ ] 4.1 Verify that tasks with i18n descriptions now display correctly in the `ActivityCard` and `TaskDetail`.
- [ ] 4.2 Test posting and reading task interactions between different user accounts.
- [ ] 4.3 Ensure the UI remains responsive and provides clear feedback during API calls.
