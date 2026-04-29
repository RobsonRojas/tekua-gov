## Context

The application currently has a partial PWA setup that is not fully recognized by mobile browsers as installable. The user interface uses a responsive sidebar/drawer pattern, but lacks touch-optimized navigation elements like a bottom bar, which is standard for modern mobile applications.

## Goals / Non-Goals

**Goals:**
- Ensure the application passes all PWA installability criteria.
- Improve mobile ergonomics with a bottom navigation bar.
- Refine the grid system for Dashboard and Work Mural for better responsiveness.

**Non-Goals:**
- Offline-first data synchronization (full DB sync). We will focus on app shell and static asset caching.
- Native deep linking (iOS Universal Links/Android App Links).

## Decisions

### 1. PWA Infrastructure Upgrade
We will move from `injectManifest` to a more robust `vite-plugin-pwa` configuration to ensure the `manifest.json` and `sw.js` are correctly linked and served.

- **Manifest Integration**: Explicitly link the manifest in `index.html` to ensure detection across all browsers.
- **Asset Generation**: A full suite of icons (192x192, 512x512, maskable, and apple-touch-icon) will be added to the build process.
- **Service Worker**: Update `custom-sw.js` to include standard Workbox caching strategies for fonts and static assets.

### 2. Adaptive Navigation Pattern
To improve mobile usability, we will implement a dual-navigation strategy:
- **Desktop/Tablet**: Sidebar remains the primary navigation tool.
- **Mobile (< 768px)**: A new `BottomNav` component will be introduced for quick access to the most frequent pages (Home, Mural, Profile). The hamburger menu will remain for less frequent or administrative actions.

### 3. Responsive Layout Strategy
Using MUI's `Grid2` and `Box` components with responsive props (`xs`, `sm`, `md`, `lg`) to ensure content flows correctly.
- **Mural de Trabalho**: Card widths will adapt from 100% on mobile to 50% on tablets and 33% on desktops.

## Risks / Trade-offs

- **[Risk] Service Worker Caching Stale Data** → **[Mitigation]** Use `registerType: 'autoUpdate'` in Vite PWA config to ensure users get the latest version as soon as possible.
- **[Trade-off] Bundle Size** → Adding more PWA assets and responsive logic will slightly increase initial bundle size, but this is offset by the performance gains of Service Worker caching for subsequent visits.
