# Proposal - Improve Language Selector Icon

## What
Modify the language selector button to indicate the current active language.

## Why
Currently, the language selector uses a generic translation icon. Users have to click it to see which language is active. Displaying the current language (e.g., "PT" or "EN") or a corresponding icon directly on the button improves clarity.

## How
1.  Locate the `LanguageSelector` component (likely in `src/components/LanguageSelector.tsx` or part of `MainLayout.tsx`).
2.  Get the `i18n.language` state.
3.  Update the button content to include the current language code or a representative icon.

## What Changes
- `src/components/LanguageSelector.tsx` (or equivalent): UI update to the button label/icon.
