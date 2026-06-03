## 1. Update Translation Resource Files

- [x] 1.1 Add keys `work.deleteTitle`, `work.deleteConfirmMessage`, `work.justification`, and `common.delete` to PT translation resource file `src/locales/pt/translation.json`
- [x] 1.2 Add keys `work.deleteTitle`, `work.deleteConfirmMessage`, `work.justification`, and `common.delete` to EN translation resource file `src/locales/en/translation.json`

## 2. Update Component Code

- [x] 2.1 Modify `ActivityCard.tsx`'s delete modal code to use correct `t('key', 'default')` call signatures instead of `||` logical OR fallbacks
