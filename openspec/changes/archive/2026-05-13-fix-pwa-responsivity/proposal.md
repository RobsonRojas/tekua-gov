## Why

The Tekua PWA currently exhibits several responsiveness issues on mobile devices, including truncated text in the user profile, cramped navigation elements, and visible translation keys in the UI. These issues degrade the user experience for community members using the platform on their phones.

## What Changes

- **Responsive Profile Layout**: Refactor the profile page to ensure long names and role descriptions are properly wrapped or truncated with tooltips, rather than breaking the layout.
- **Mobile Navigation Polish**: Adjust the bottom navigation bar to handle longer labels gracefully and fix visible translation keys (e.g., `layout.notifications`).
- **PWA Layout Hardening**: Ensure consistent padding and scaling across different mobile screen sizes for core application pages (Dashboard, Mural de Trabalho, Perfil).

## Capabilities

### New Capabilities
- `mobile-responsive-ui`: Defines the standards and specific fixes for mobile UI responsiveness across the PWA.

### Modified Capabilities
- `user-profile`: Update UI requirements to ensure mobile responsiveness for profile details.
- `navigation-interface`: Update requirements for bottom navigation label handling and mobile spacing.
- `i18n-interface`: Ensure all layout-related translation keys are properly resolved in the mobile view.

## Impact

- `src/pages/Profile.tsx`: Layout adjustments for mobile.
- `src/components/Navigation.tsx` (or equivalent): Bottom navigation styling and label handling.
- `src/locales/`: Verification of missing/unresolved translation keys.
- CSS/Styling: Global or component-specific media queries for better PWA scaling.
