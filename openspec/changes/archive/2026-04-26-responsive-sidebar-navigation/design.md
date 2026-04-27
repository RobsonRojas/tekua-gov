## Context

The Tekua Governance Portal currently utilizes a traditional top-aligned navigation bar (`AppBar`). While functional, this layout limits horizontal space for content and doesn't scale well as more navigation items are added. The platform also needs a more robust mobile experience, transitioning from a simple top bar to a standard mobile navigation pattern (hamburger menu).

## Goals / Non-Goals

**Goals:**
- Implement a responsive sidebar navigation that adapts to Desktop, Tablet, and Smartphone screens.
- Use a permanent sidebar on Desktop (>900px) that can be collapsed to an icon-only view.
- Use a temporary "Hamburger" drawer on Mobile (<900px).
- Centralize layout constants (sidebar width) in the theme or a separate utility.
- Maintain existing feature accessibility (Notifications, Theme Toggle, Language Selector).

**Non-Goals:**
- Refactoring the internal logic of individual pages.
- Changing the routing structure or paths.
- Redesigning the footer (it will remain at the bottom of the content area).

## Decisions

- **MUI Drawer**: Leverage Material UI's `Drawer` component for both the sidebar and the mobile menu to ensure consistency and accessibility.
- **Adaptive Breakpoints**: Use the `md` breakpoint (900px) as the threshold for switching between the sidebar and the mobile header.
- **Sidebar Organization**: 
    - Top: Logo and Branding.
    - Middle: Navigation links (Dashboard, Wallet, Mural, etc.).
    - Bottom: Profile, Theme Toggle, Language, and Logout.
- **Content Container**: The main content area will use a dynamic `marginLeft` or `paddingLeft` that mirrors the sidebar's width.

## Risks / Trade-offs

- **Horizontal Space**: A persistent sidebar reduces the horizontal width available for tables and maps. Mitigation: Allow the sidebar to be collapsed to a "mini-variant".
- **Mobile Interaction**: Users might expect a bottom navigation bar instead of a hamburger menu. Decision: Use a hamburger menu to accommodate the growing number of features (more than 5).
- **Layout Shift**: Transitioning between breakpoints might cause visible layout jumps. Mitigation: Use CSS transitions for the sidebar width changes.
