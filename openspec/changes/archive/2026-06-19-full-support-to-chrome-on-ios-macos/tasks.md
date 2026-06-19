## 1. Browser Detection

- [x] 1.1 In `src/context/PWAContext.tsx`, update the `PWAContextType` to include `browser: 'safari' | 'chrome' | 'other'`.
- [x] 1.2 Update the `useEffect` parsing logic in `PWAContext.tsx` to detect `crios` in `navigator.userAgent` and set `browser` to `'chrome'`. For standard iOS webkit lacking `crios`, set `browser` to `'safari'`.
- [x] 1.3 Ensure macOS Chrome is correctly detected as `desktop` platform without breaking existing `beforeinstallprompt` logic.

## 2. Install Prompt Updates

- [x] 2.1 In `src/components/pwa/InstallPrompt.tsx`, fetch the new `browser` value from `usePWA()`.
- [x] 2.2 Create a new `iOSChromeInstructions` JSX element tailored for Chrome on iOS. It should reference the top-right menu (e.g., using `MoreVertical` or standard Share icon) and say "Toque no ícone do menu e selecione 'Adicionar à Tela de Início'".
- [x] 2.3 Conditionally render `iOSChromeInstructions` instead of `iOSInstructions` when `platform === 'ios'` and `browser === 'chrome'`.
- [x] 2.4 Verify that for macOS (where `platform === 'desktop'`), the standard install button and flow remain unaffected.
