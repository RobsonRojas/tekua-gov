## Context

The "Enviar Documento" button in the document upload form (`DocumentUploadForm.tsx`) has a styling issue where the text color is dark on a dark green background, causing very low contrast.

## Goals / Non-Goals

**Goals:**
- Improve readability of the submit button text by increasing the contrast ratio against its background.
- Ensure the fix follows the existing UI theme patterns.

**Non-Goals:**
- Completely redesigning the document upload form.
- Modifying other components unless they share the same specific flawed style instance.

## Decisions

**1. Apply High-Contrast Text Color**
We will change the text color of the button to white (or another high-contrast color defined in the theme) while keeping its background color dark green. This can be achieved by using the `color` property or the corresponding Material-UI (MUI) prop such as `color="primary"` or explicitly setting the `sx` style for `color: 'white'`.

## Risks / Trade-offs

- **Risk:** Button might lose its custom styling if relying entirely on default MUI colors.
  - *Mitigation:* We will specifically target the text color in the `sx` prop or rely on proper MUI theming that ensures high contrast for primary buttons.
