## 1. Structure & Theme

- [ ] 1.1 Define layout constants in `theme.ts` (e.g., `SIDEBAR_WIDTH`, `SIDEBAR_COLLAPSED_WIDTH`).
- [ ] 1.2 Identify and extract navigation logic into a reusable `NavigationItems` component or hook.

## 2. Component Implementation

- [ ] 2.1 Implement the `Sidebar` component using MUI `Drawer` with support for `mini-variant`.
- [ ] 2.2 Implement the `MobileHeader` component with a hamburger menu button.
- [ ] 2.3 Implement the mobile `NavigationDrawer` that opens from the hamburger menu.

## 3. MainLayout Integration

- [ ] 3.1 Refactor `MainLayout.tsx` to use `useMediaQuery` for detecting device types.
- [ ] 3.2 Remove the redundant "Perfil" (Profile) link from the `navItems` array.
- [ ] 3.3 Integrate the `Sidebar` for Desktop/Tablet views.
- [ ] 3.4 Integrate the `MobileHeader` for Smartphone views.
- [ ] 3.5 Adjust the main content container to dynamically resize based on the sidebar state.

## 4. Verification

- [ ] 4.1 Verify layout on Desktop (>= 900px) with sidebar expansion/collapse.
- [ ] 4.2 Verify layout on Tablet (600px - 900px).
- [ ] 4.3 Verify layout on Smartphone (< 600px) with hamburger menu functionality.
