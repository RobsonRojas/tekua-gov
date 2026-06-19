## Why

The "Enviar Documento" button on the document upload form currently has dark text on a dark green background. This extremely low contrast makes it very difficult for users to read the button text, creating an accessibility and usability issue. Fixing this will improve the readability and overall user experience.

## What Changes

- Update the styling of the submit button in `DocumentUploadForm.tsx` to use white text (or an appropriate high-contrast color) against the primary dark green background.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- **UI**: The `DocumentUploadForm` component's submit button.
- **Accessibility**: Better contrast ratio conforming to standard web accessibility guidelines.
