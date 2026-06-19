## Why

Currently, the PWA installation instructions assume the user is on Safari when accessing via an iOS device. However, Chrome on iOS (`CriOS`) has a different UI for sharing and adding to the home screen. Furthermore, macOS Chrome users need to ensure the standard PWA prompt works or receive specific instructions if `beforeinstallprompt` behaves differently. Supporting these specific browser/OS combinations ensures all users can successfully install the application regardless of their preferred browser.

## What Changes

- Add browser detection logic in `PWAContext.tsx` to explicitly identify Chrome on iOS (`crios`) and Chrome on macOS.
- Update `InstallPrompt.tsx` to conditionally render Chrome-specific installation instructions for iOS users (e.g., using the Chrome Share icon and specific menu steps).
- Ensure macOS Chrome users receive the correct installation flow or prompt.

## Capabilities

### New Capabilities
- `browser-specific-pwa-prompts`: Ability to serve customized PWA installation instructions based on the specific browser (Chrome vs Safari) on Apple operating systems.

### Modified Capabilities
- `pwa-install-logic`: Enhanced platform and browser detection.

## Impact

- **UI**: The `InstallPrompt` component will have dynamic content based on whether the iOS user is on Safari or Chrome.
- **Context**: `PWAContext` will expose a `browser` state (e.g., `safari`, `chrome`) alongside `platform`.
