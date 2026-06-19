## Why

O chunk `vendor-core` tem 885 KB (gzip: 274 KB), excedendo o limite de 600 KB. Esse chunk é um catch-all que acumula todas as dependências não categorizadas (framer-motion, react-quill, i18next, @zxing, etc.). Chunks grandes impactam o tempo de carregamento inicial, especialmente em dispositivos móveis.

## What Changes

- Extrair `framer-motion` para chunk próprio (`vendor-animation`)
- Extrair `react-quill` para chunk próprio (`vendor-editor`)
- Extrair `i18next`, `react-i18next` e `i18next-browser-languagedetector` para chunk próprio (`vendor-i18n`)
- Extrair `@zxing/browser` e `@zxing/library` para chunk próprio (`vendor-barcode`)
- Extrair `react-markdown` e `dompurify` para chunk próprio (`vendor-markdown`)
- Manter catch-all `vendor-core` apenas para as bibliotecas restantes (date-fns, browser-image-compression, qrcode.react, idb)
- Reduzir `chunkSizeWarningLimit` de 600 para 400 após a reorganização

## Capabilities

### New Capabilities
_(none — build optimization only)_

### Modified Capabilities
_(none — no spec-level behavior changes)_

## Impact

- `vite.config.ts`: alterar `manualChunks` para dividir vendor-core em chunks menores
- Nenhuma alteração de código runtime, apenas configuração de build
