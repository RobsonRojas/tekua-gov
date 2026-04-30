## Why

The Tekuá Governance Portal currently lacks native-like mobile experience and offline resilience. Users cannot install the application on their devices, and the UI, while functional, is not fully optimized for the diverse ergonomics of smartphones, tablets, and desktops. Implementing full PWA support and refining responsiveness will increase engagement and ensure the portal is accessible anytime, anywhere.

## What Changes

- **Progressive Web App (PWA) Implementation**:
    - Complete configuration of `vite-plugin-pwa` for full installability.
    - Generation and integration of a comprehensive set of icons (including maskable and Apple-specific).
    - Creation of a custom splash screen and theme color alignment.
    - Implementation of an in-app "Install App" button/prompt for eligible devices.
    - Offline support for critical static assets and core UI routes.
- **Responsive Design Enhancement**:
    - Introduction of a Mobile Bottom Navigation Bar for core actions to improve thumb-reachability on smartphones.
    - Adaptive layout for the Dashboard and Work Mural to better utilize tablet and desktop screen real estate.
    - Font-size and spacing optimization for touch-first interaction on small screens.
    - Improvement of the "Mural de Trabalho" card layout for narrow screens.

## Capabilities

### New Capabilities
- `pwa-core`: Handles the technical requirements for PWA, including the web manifest, service worker lifecycle, and browser installation prompts.

### Modified Capabilities
- `navigation-interface`: Enhanced to include adaptive UI patterns like mobile-first bottom navigation and optimized responsive layouts for all viewports.

## Impact

- **Build Pipeline**: Configuration changes in `vite.config.ts`.
- **Assets**: New icons and manifest files in `public/`.
- **Frontend Components**: New `InstallPrompt` and `BottomNav` components; CSS updates for responsiveness in existing components like `Sidebar`, `Header`, and `ActivityCard`.
- **Service Worker**: Updates to `custom-sw.js` for better caching and notification handling.
