## Context

The `PWAContext` currently detects the platform (`ios`, `android`, `desktop`) but does not differentiate the browser on iOS. On iOS, Safari has a specific share icon and "Add to Home Screen" action. Chrome on iOS (`CriOS`) also allows adding to the home screen, but the user must use the Chrome Share menu (often located in the top right corner) and select "Adicionar à Tela de Início". On macOS Chrome, `beforeinstallprompt` generally works natively, but we need to explicitly verify the behavior or display targeted messages if needed.

## Goals / Non-Goals

**Goals:**
- Identify Chrome on iOS via the `CriOS` user agent substring.
- Identify Chrome on macOS via `Mac OS X` and `Chrome` user agent substrings.
- Present accurate, browser-specific instructions in the `InstallPrompt` for Chrome iOS users.
- Ensure macOS Chrome users receive the standard install prompt without issues.

**Non-Goals:**
- Forcing installation on browsers that fundamentally block PWA installation (like iOS Firefox, which has limited support).

## Decisions

**1. Enhanced Context Detection**
We will update `PWAContextType` to include `browser: 'safari' | 'chrome' | 'other'`.
Inside the `useEffect` of `PWAContext.tsx`:
- Parse `navigator.userAgent` to detect `CriOS` (Chrome iOS) and `Chrome` (Desktop/Android Chrome).
- Distinguish macOS Chrome using `Mac OS X`.

**2. Dynamic Instructions in `InstallPrompt.tsx`**
We will create a specific instruction block for `iOS Chrome`:
- Icon: We can use a generic `MoreVertical` or standard `Share` icon, indicating the Chrome menu.
- Text: "1. Toque no ícone de Compartilhar no menu superior" -> "2. Selecione 'Adicionar à Tela de Início'".
The existing `iOSInstructions` will be conditionally used for Safari.

## Risks / Trade-offs

- **Risk:** User agents can be spoofed or change formats in the future.
  - *Mitigation:* `CriOS` has been the standard identifier for Chrome on iOS for years. It is a highly stable identifier.
