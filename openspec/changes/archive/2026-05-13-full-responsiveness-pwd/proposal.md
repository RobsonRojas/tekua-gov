## Why

The current PWA implementation relies on the browser's native installation prompts, which are often missed by users. Additionally, while the core navigation is responsive, some system screens require further optimization to ensure a premium "native-app" feel on smartphones.

## What Changes

- **Custom PWA Install Prompt**: Implementation of a visible "Install" button within the application UI to encourage smartphone installation.
- **System-wide Responsiveness Audit and Fixes**: Reviewing all main pages (Dashboard, Mural, Admin Panel) to ensure they are fully optimized for mobile devices, removing any horizontal scrolling and improving touch ergonomics.
- **PWA Lifecycle Management**: Improving the logic to detect if the app is installable and tracking the installation state.

## Capabilities

### New Capabilities
- `pwa-install-logic`: Logic and UI components for the custom PWA installation prompt.

### Modified Capabilities
- `navigation-interface`: Optimization of the Bottom Navigation and Mobile Drawer for better ergonomics.
- `pwa-core`: Addition of requirements for explicit installation prompts.
- `theme-management`: Refinement of responsive breakpoints and mobile-specific tokens if needed.

## Impact

- **UI/UX**: Improved user onboarding for mobile users.
- **Frontend**: New components for the install prompt and layout adjustments across various pages.
- **PWA**: Updates to the service worker or manifest if necessary to support custom installation logic.
