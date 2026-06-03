## Why

The task deletion modal on the work wall currently displays raw translation keys (like `work.deleteTitle`, `work.deleteConfirmMessage`, `work.justification`, and `common.delete`) instead of localized strings. This degrades the user experience and violates the requirement that all UI elements be properly translated without displaying raw keys.

## What Changes

- Add the following translation keys to PT (Portuguese) and EN (English) translation files:
  - `work.deleteTitle`
  - `work.deleteConfirmMessage`
  - `work.justification`
  - `common.delete`
- Modify the fallback logic in `ActivityCard.tsx`'s delete dialog to use correct `t('key', 'default')` signature instead of the `||` operator, ensuring safe fallback to human-readable strings if translations are ever missing.

## Capabilities

### New Capabilities

*None*

### Modified Capabilities

- `i18n-interface`: Fix translation keys resolution and fallbacks in task deletion modal, preventing raw keys from being shown.

## Impact

- Translation resource files: `src/locales/pt/translation.json`, `src/locales/en/translation.json`
- Component code: `src/components/ActivityCard.tsx`
