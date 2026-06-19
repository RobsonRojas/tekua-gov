## 1. Implement Link Viewing Behavior

- [x] 1.1 Update `handleView` in `src/components/admin/DocumentList.tsx` to detect `doc.external_url` and open the link directly in a new tab using `window.open` with `_blank` and `noopener,noreferrer`.
- [x] 1.2 Ensure the modal visualizer (`DocumentViewerModal`) is not opened when the document has an `external_url`.

## 2. Testing and Verification

- [x] 2.1 Add/update Playwright E2E tests in `tests/documentation.spec.ts` to mock and verify that clicking a link document opens it in a new tab.
- [x] 2.2 Run Playwright tests and unit tests to ensure all tests pass and there are no regressions.
