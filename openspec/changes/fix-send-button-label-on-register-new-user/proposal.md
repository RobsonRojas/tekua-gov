## Why

The "Send" button in the "New Member" modal (for registering new users) is currently displaying the raw i18n keys `common.send` and `common.sending` instead of the localized labels. This occurs because these keys are missing from the `common` namespace in the translation files.

## What Changes

- Add `send` and `sending` keys to the `common` namespace in `src/locales/pt/translation.json` and `src/locales/en/translation.json`.
- Ensure the labels are consistent with the rest of the application ("Enviar" / "Sending" or "Submit" / "Submitting").

## Capabilities

### Modified Capabilities
- `i18n-interface`: Update common translation keys to include missing button labels used in admin modals.

## Impact

- **Affected Files**:
  - `src/locales/pt/translation.json`
  - `src/locales/en/translation.json`
- **UI**: The registration button in the admin panel will now show human-readable text.
