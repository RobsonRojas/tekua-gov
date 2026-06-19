## Why

Currently, when a user views a document (like a PDF) in the DocumentViewerModal, they can still select the text and copy it. This violates security requirements where document contents should be protected against unauthorized duplication or extraction. We need to explicitly block text selection and copying to ensure data protection.

## What Changes

- Add a transparent overlay or CSS pointer-events blocking over the PDF iframe to prevent mouse interactions that lead to text selection.
- Intercept keyboard shortcuts (Ctrl+C, Cmd+C) and the context menu (right-click) globally within the viewer modal to prevent copying.
- Ensure scrolling is still possible (e.g., via mouse wheel or custom scrollable container) despite interaction restrictions.

## Capabilities

### New Capabilities

### Modified Capabilities
- `documentation-viewer`: Add the restriction to prevent selecting and copying text in the viewer.

## Impact

- **UI**: The `DocumentViewerModal` component.
- **Security**: Enhanced document content protection against basic copy/paste.
