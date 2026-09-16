## 1. Implement Theme Toggle in MobileDrawer

- [x] 1.1 Import `useThemeContext` from `../../context/ThemeContext` and `Moon`, `Sun` icons from `lucide-react`, and `IconButton`, `Tooltip` from MUI in `src/components/Navigation/MobileDrawer.tsx`
- [x] 1.2 Add a theme toggle `IconButton` next to the `LanguageSelector` in the bottom `List` section of the drawer (around line 113), using the same pattern as `Sidebar.tsx` lines 177-186: `IconButton` with `Tooltip`, showing `Sun` when dark mode and `Moon` when light mode, calling `toggleTheme()` on click

## 2. Verification

- [x] 2.1 Build the project (`npm run build`) to verify no TypeScript compilation errors
- [x] 2.2 Visually verify on mobile viewport: open the drawer and confirm the Sun/Moon icon is visible next to the language selector and toggles the theme on tap
