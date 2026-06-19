## 1. Implement Copy Protection

- [x] 1.1 In `src/components/common/DocumentViewerModal.tsx`, update the global `keydown` event listener to intercept `Ctrl+C` and `Cmd+C` events and prevent default behavior.
- [x] 1.2 In `src/components/common/DocumentViewerModal.tsx`, add an `onCopy` event handler to the `Dialog` wrapper to `e.preventDefault()`.

## 2. Implement Overlay Protection for PDFs

- [x] 2.1 In `src/components/common/DocumentViewerModal.tsx`, wrap the `iframe` used for PDF viewing in a container (`Box`).
- [x] 2.2 Add an absolute-positioned transparent overlay (`Box`) on top of the `iframe` to intercept mouse events, effectively blocking selection within the native PDF viewer. Ensure the container manages scrolling if necessary, or the overlay allows scroll events to pass through while blocking clicks.

## 3. Verification

- [x] 3.1 Test viewing an image and a PDF to verify that text selection and copying (`Ctrl+C`, Right Click -> Copy) are effectively blocked.
- [x] 3.2 Ensure scrolling the document still works correctly.
