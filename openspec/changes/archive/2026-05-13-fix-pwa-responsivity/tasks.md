## 1. i18n & Localization Fixes

- [x] 1.1 Add `layout.notifications` key to `src/locales/pt/translation.json` ("Notificações")
- [x] 1.2 Add `layout.notifications` key to `src/locales/en/translation.json` ("Notifications")
- [x] 1.3 Audit other navigation keys to ensure consistency between PT and EN locales

## 2. Navigation Interface Improvements

- [x] 2.1 Update `src/components/layout/BottomNav.tsx` to use the correct translation keys
- [x] 2.2 Adjust `BottomNavigationAction` styles to handle long labels (responsive font size or ellipsis)
- [x] 2.3 Ensure bottom navigation spacing is optimized for narrow mobile screens (< 360px)

## 3. Profile Page Responsiveness

- [x] 3.1 Refactor `src/pages/Profile.tsx` to handle long names with proper wrapping or truncation
- [x] 3.2 Adjust role/function labels in the profile to be responsive on mobile
- [x] 3.3 Ensure profile action buttons (Edit/Save) are properly aligned and sized on small screens
- [x] 3.4 Verify padding and spacing in `Profile.tsx` sections for PWA mobile view

## 4. Verification

- [x] 4.1 Verify mobile layout in browser dev tools for various screen sizes (360px to 768px)
- [x] 4.2 Confirm all translation keys in the bottom navigation are resolving correctly
- [x] 4.3 Test long name wrapping in the profile page using mock data or local DB
