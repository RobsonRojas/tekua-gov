# Proposal: Fix Work Approval and Edit Button

## The Problem
1. On the Work Details page ("Contribuição Individual"), the edit button is not being displayed correctly and shows an untranslated translation key `common.edit`.
2. There is no clear action button for the Beneficiary to approve and confirm the completed work.

## The Solution
1. Fix the translation of the edit button so it correctly shows "Editar" (or the respective i18n label).
2. Ensure the edit button is visible conditionally when the current user has permissions to edit the work (e.g. they are the executor or admin).
3. Implement an "Aprovar" (Approve) button that is visible specifically for the Beneficiary of the work, allowing them to confirm that the work was executed successfully.

## Key Features
- Properly translated Edit button on the Work details header.
- New "Aprovar Trabalho" button in the Validation section for the Beneficiary.
- Update work status and validation counters upon approval by the Beneficiary.
