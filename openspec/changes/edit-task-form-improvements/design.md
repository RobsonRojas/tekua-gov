# Design: Edit Task Form Improvements

## 1. Architecture
- **Frontend Component:** The `EditWorkModal.tsx` or the edit section in `TaskDetail.tsx` needs to be updated.
- We will add the missing keys to the i18n JSON files (`src/locales/pt/translation.json`, etc.).
- We will add a `TextField` of type `number` to handle `min_confirmations`.

## 2. API / Database Changes
- The `updateActivity` endpoint in `api-work` needs to accept `min_confirmations` (or `threshold`) so it can be updated on the server.
- The `createActivity` endpoint needs to default `min_confirmations` to 1 if it's currently hardcoded to something else, or the frontend needs to pass 1.

## 3. UI/UX Flow
- User clicks "Editar".
- Modal opens. All text and buttons (e.g., "Salvar") are translated correctly.
- A new field "Número de Confirmações" is visible, defaulting to the current value, allowing the user to increase/decrease it.
- Saving the form updates the activity in the database and refetches the detail view.
