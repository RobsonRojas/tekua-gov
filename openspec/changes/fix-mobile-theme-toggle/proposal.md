## Why

The theme toggle button (Sun/Moon icon) is missing from the mobile PWA interface. On desktop, the theme toggle lives in the `Sidebar` component, but on mobile the layout switches to `MobileDrawer` + `MobileHeader` — neither of which includes the theme toggle. This means mobile users cannot switch between light and dark modes, breaking the existing `theme-management` spec that requires users to be able to toggle themes from the header.

## What Changes

- Add the theme toggle (Sun/Moon icon button) to the `MobileDrawer` component, placed next to the existing `LanguageSelector` for consistency with the desktop `Sidebar` layout
- The toggle must call `toggleTheme()` from `ThemeContext` and persist the preference, just like the desktop version

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `theme-management`: Extending the existing theme toggle requirement to explicitly cover the mobile PWA layout — the theme toggle SHALL be accessible on all viewport sizes, including the mobile drawer navigation.

## Impact

- **Frontend**: `src/components/Navigation/MobileDrawer.tsx` — add theme toggle icon button
- **No backend changes**
- **No new dependencies**: Uses existing `ThemeContext`, lucide-react icons (Moon/Sun), and MUI `IconButton` already available in the project
