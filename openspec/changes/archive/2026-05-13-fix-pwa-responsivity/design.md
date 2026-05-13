## Context

The Tekua PWA is built with React, Material UI (MUI), and Vite. While it follows a mobile-first approach, certain components like the User Profile and Bottom Navigation are failing to handle edge cases like long strings or missing translations, leading to layout breaks and poor user experience on small mobile screens (e.g., iPhone SE, older Android devices).

## Goals / Non-Goals

**Goals:**
- Fix layout breaking in `Profile.tsx` for users with long names/roles.
- Ensure `BottomNav.tsx` labels fit correctly on mobile screens.
- Resolve missing translation keys in the navigation layout.
- Improve general padding and scaling for mobile PWA views.

**Non-Goals:**
- Complete redesign of the navigation system.
- Adding new features to the profile page.
- Performance optimization of the PWA (unless directly related to layout).

## Decisions

### 1. CSS-based Text Handling in Profile
- **Decision**: Use MUI `Typography` properties combined with custom CSS for text wrapping and truncation.
- **Rationale**: Long names should wrap to preserve context, while roles/functions can be truncated with ellipses if they exceed a certain length to maintain vertical alignment.
- **Alternatives**: Using a modal for full info (too intrusive) or horizontal scrolling (poor UX).

### 2. Responsive Scaling for Bottom Navigation
- **Decision**: Adjust `BottomNavigationAction` labels using media queries to reduce font size or use abbreviations on very small screens (< 360px).
- **Rationale**: Ensures that even in "English" (which often has longer words like "Notifications" vs "Alertas"), the labels don't overlap.
- **Alternatives**: Icon-only navigation on small screens (loses clarity for new users).

### 3. Translation Key Audit and Fallback
- **Decision**: Add missing `layout.notifications` key to PT/EN locales and implement a helper or use `i18next` configuration to prevent raw key display.
- **Rationale**: Improves professionalism and accessibility.
- **Alternatives**: Hardcoded strings (violates i18n patterns).

## Risks / Trade-offs

- **[Risk]** Reducción de legibilidade en fontes moi pequenas → **Mitigation**: Use a minimum font size (10px) and prioritize icons.
- **[Risk]** Layout shifts during translation loading → **Mitigation**: Ensure containers have fixed heights or use skeletons.
