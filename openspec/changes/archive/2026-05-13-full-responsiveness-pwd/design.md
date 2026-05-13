## Context

The platform is a Vite-based React application using Material UI (MUI). While it has basic PWA configuration via `vite-plugin-pwa`, it lacks a user-facing installation trigger. Responsiveness is mostly handled by MUI, but specific complex pages like the Mural and Dashboard need refinement for better mobile ergonomics.

## Goals / Non-Goals

**Goals:**
- Implement a robust PWA installation detection and trigger mechanism.
- Add an intuitive "Install App" button in the mobile navigation.
- Ensure 100% responsiveness on all core application pages.
- Standardize spacing and touch targets for mobile users.

**Non-Goals:**
- Implementing push notifications (out of scope for this change).
- Major backend refactoring.
- Redesigning the entire brand identity.

## Decisions

### 1. PWA Installation State Management
- **Choice**: Create a `PWAContext` and a `usePWA` hook.
- **Rationale**: The `beforeinstallprompt` event is fired once and its prompt can only be triggered once. A global context allows any component to subscribe to the "installable" state and trigger the prompt.
- **Alternatives**: Managing state locally in the AppBar. *Rejected* because we want to show the prompt in multiple places (Settings, Mobile Drawer, etc.).

### 2. Responsive Layout Strategy
- **Choice**: Use MUI's `Box`, `Container`, and `Grid2` with proper breakpoint mapping.
- **Rationale**: Leverages the existing theme system. We will audit `Dashboard.tsx` and `WorkWall.tsx` to replace hardcoded pixel values with responsive units or percentage-based widths.
- **Decision**: Implement a `MobileSafeView` wrapper if needed to handle notch/safe-areas on modern smartphones.

### 3. Navigation Adjustments
- **Choice**: Integrate the "Install App" action as a primary item in the `MobileDrawer` (Hamburger Menu).
- **Rationale**: It's a high-value action but shouldn't clutter the persistent `BottomNavigation`.

## Risks / Trade-offs

- **[Risk] Browser Support** → The `beforeinstallprompt` event is not supported on iOS Safari. *Mitigation*: On iOS, we will display a "How to Install" guide (Add to Home Screen) instead of a direct button.
- **[Trade-off] Bundle Size** → Adding logic for PWA state tracking. *Mitigation*: The logic is lightweight and relies on standard Web APIs.
