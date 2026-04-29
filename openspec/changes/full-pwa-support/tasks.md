## 1. PWA Foundation and Branding

- [x] 1.1 Refine `vite.config.ts` PWA configuration to ensure full manifest generation and service worker registration.
- [x] 1.2 Generate and add a complete set of PWA icons to the `public/` directory (192x192, 512x512, maskable, apple-touch).
- [x] 1.3 Update `index.html` with required PWA meta tags and explicit manifest linkage.
- [x] 1.4 Implement a logic in `main.tsx` or a dedicated hook to capture and handle the `beforeinstallprompt` event for custom installation triggers.

## 2. Optimized Mobile Navigation

- [x] 2.1 Create a `BottomNav` component using MUI `BottomNavigation` for quick access to core features on mobile.
- [x] 2.2 Integrate the `BottomNav` into the main application layout, ensuring it is only visible on viewports narrower than 768px.
- [x] 2.3 Adjust the `Sidebar` behavior to automatically hide and transition to a drawer pattern on mobile devices.
- [x] 2.4 Update navigation links to ensure they work seamlessly across both the Sidebar and the new BottomNav.

## 3. Responsive Layout Refinement

- [x] 3.1 Review and update the Dashboard component to use a responsive grid that stacks vertically on mobile and expands to multiple columns on desktop.
- [x] 3.2 Refactor the `WorkWall` (Mural de Trabalho) card grid to adapt columns based on screen width (1 col for mobile, 2 for tablet, 3+ for desktop).
- [x] 3.3 Audit and adjust global CSS variables (spacing, font sizes) to improve touch ergonomics on small screens.

## 4. Verification and Polish

- [x] 4.1 Perform a Lighthouse audit to verify that all PWA installability requirements are met.
- [x] 4.2 Conduct visual testing across multiple device simulations (iPhone SE, iPad, Desktop 1080p).
- [x] 4.3 Verify that the service worker correctly caches the application shell for basic offline access.
