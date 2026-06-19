## 1. Configuração de Build

- [x] 1.1 Extrair `framer-motion` para chunk `vendor-animation`
- [x] 1.2 Extrair `react-quill-new` para chunk `vendor-editor`
- [x] 1.3 Extrair `@zxing/browser` e `@zxing/library` para chunk `vendor-barcode`
- [x] 1.4 Extrair `i18next`, `react-i18next` e `i18next-browser-languagedetector` para chunk `vendor-i18n`
- [x] 1.5 Extrair `react-markdown` e `dompurify` para chunk `vendor-markdown`
- [x] 1.6 Extrair `date-fns` para chunk `vendor-date`
- [x] 1.7 Extrair `@reduxjs/toolkit`, `redux`, `react-redux`, `immer`, `reselect`, `redux-thunk` para chunk `vendor-state`
- [x] 1.8 Extrair `lodash-*` e `es-toolkit` para chunk `vendor-utils`
- [x] 1.9 Reduzir `chunkSizeWarningLimit` para 400

## 2. Verificação

- [x] 2.1 Rodar build e confirmar que nenhum chunk excede 400 KB
