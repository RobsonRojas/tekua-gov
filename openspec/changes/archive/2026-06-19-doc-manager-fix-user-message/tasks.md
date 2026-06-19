## 1. Localization Keys

- [x] 1.1 Add error translation keys (`docs.errors.fileTooLarge`, `docs.errors.permissionDenied`, `docs.errors.alreadyExists`, `docs.errors.uploadFailed`, `docs.errors.deleteFailed`, `docs.errors.validationFailed`) to `src/locales/pt/translation.json`.
- [x] 1.2 Add the corresponding error translation keys to `src/locales/en/translation.json`.

## 2. Hook Implementation

- [x] 2.1 Update `src/hooks/useDocuments.ts` to import and initialize `useTranslation`.
- [x] 2.2 Refactor `uploadDocument` to catch, map, and translate storage upload and metadata registration errors.
- [x] 2.3 Refactor `deleteDocument` to catch, map, and translate deletion errors.

## 3. Verification

- [x] 3.1 Update unit tests in `src/hooks/useDocuments.test.ts` to expect localized/sanitized error messages when uploads or deletions fail.
- [x] 3.2 Run the test suite (`npm run test`) to ensure all tests pass.
