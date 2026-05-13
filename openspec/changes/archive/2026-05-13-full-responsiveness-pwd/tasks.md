## 1. PWA Infrastructure & Core Logic

- [x] 1.1 Create `src/context/PWAContext.tsx` to handle the `beforeinstallprompt` event and installation state.
- [x] 1.2 Implement the `usePWA` custom hook for easy access to installation logic.
- [x] 1.3 Wrap the application with `PWAProvider` in `src/App.tsx`.

## 2. UI Components & Integration

- [x] 2.1 Create a reusable `InstallPrompt` component that adapts to Android (direct install) and iOS (instructions).
- [x] 2.2 Integrate the `InstallPrompt` into the `MobileDrawer` navigation.
- [x] 2.3 Add a subtle "Install App" reminder in the user profile or settings page.

## 3. System-wide Responsiveness Optimization

- [x] 3.1 Audit and fix responsiveness issues in the `Dashboard` page (ensure grid stacking).
- [x] 3.2 Audit and fix responsiveness issues in the `WorkWall` (Task Mural), preventing horizontal overflow.
- [x] 3.3 Verify and adjust padding/spacing in `AdminPanel` for better mobile usage.
- [x] 3.4 Ensure the `BottomNavigation` and `Sidebar` transitions are smooth and ergonomically sound.

## 4. Verification & Testing

- [x] 4.1 Verify PWA installability in a desktop browser (via manifest detection).
- [x] 4.2 Verify responsive layout for mobile (375px width) in Chrome DevTools.
- [x] 4.3 Test the "Install App" flow in both the Sidebar and Profile page.
