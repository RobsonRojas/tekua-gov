# Tasks: Edit Task Form Improvements

## 1. Fix Translations
- [x] Identify the edit form component (e.g., `TaskDetail.tsx` modal or a separate `EditWorkModal` component).
- [x] Add missing translation keys (`work.editTaskTitle`, `work.executorHelper`, `common.save`) to `src/locales/pt/translation.json` and `src/locales/en/translation.json`.
- [x] Make sure the `t()` function is correctly imported and used for these labels.

## 2. Default Confirmations Configuration
- [x] Check `src/pages/RegisterWork.tsx` or the backend `api-work` function `createActivity` and ensure the default `min_confirmations` is set to 1. 

## 3. Editable Confirmations Field
- [x] Add a `minConfirmations` state and input field to the edit form.
- [x] Update the `api-work` -> `updateActivity` logic (both in the frontend `apiClient.invoke` and the backend Edge Function) to accept and update the `min_confirmations` field in the database.
