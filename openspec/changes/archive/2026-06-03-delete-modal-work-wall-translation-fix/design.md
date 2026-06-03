## Context

The task deletion modal inside `ActivityCard.tsx` references several keys that do not exist in Portuguese (`translation.json` for `pt`) and English (`translation.json` for `en`). Moreover, the fallback logic uses standard Javascript logical OR (`||`), which fails when a missing key returns the string value of the key itself (which evaluates to truthy).

## Goals / Non-Goals

**Goals:**
- Add missing translation keys (`work.deleteTitle`, `work.deleteConfirmMessage`, `work.justification`, and `common.delete`) in PT and EN locales.
- Ensure that the modal components in `ActivityCard.tsx` utilize react-i18next fallback options rather than the logical OR operator on key string returns.

**Non-Goals:**
- Changing the deletion functionality itself.
- Redesigning the deletion modal UI layout or styling.

## Decisions

### Decision: Update fallback syntax in useTranslation
Instead of using `t('key') || 'Fallback'`, we will use `t('key', 'Fallback')` or ensure translation files are fully populated. This is standard react-i18next usage to correctly support default values when keys are missing.

### Decision: Add keys to localization JSON
Populate PT and EN files with the relevant translations for deletion UI elements:
- PT:
  - `work.deleteTitle`: "Remover Atividade"
  - `work.deleteConfirmMessage`: "Tem certeza que deseja remover esta atividade? Esta ação exige uma justificativa e será auditada."
  - `work.justification`: "Justificativa"
  - `common.delete`: "Remover"
- EN:
  - `work.deleteTitle`: "Delete Activity"
  - `work.deleteConfirmMessage`: "Are you sure you want to delete this activity? This action requires a justification and will be audited."
  - `work.justification`: "Justification"
  - `common.delete`: "Delete"

## Risks / Trade-offs

*None*
