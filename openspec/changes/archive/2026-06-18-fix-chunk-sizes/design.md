## Context

O `manualChunks` atual tem um catch-all `vendor-core` que acumula todas as dependências não categorizadas: framer-motion, react-quill, i18next, @zxing, react-markdown, dompurify, date-fns, qrcode.react, etc. Isso resulta em um chunk de 885 KB.

## Goals / Non-Goals

**Goals:**
- Reduzir o maior chunk para abaixo de 600 KB (idealmente < 400 KB)
- Garantir que nenhum chunk exceda 600 KB após a reorganização

**Non-Goals:**
- Não alterar código de aplicação
- Não adicionar lazy loading de rotas (seria outra change)
- Não alterar dependências

## Decisions

### Novos chunks a partir do vendor-core

Os chunks serão criados baseados no tamanho estimado de cada grupo:

| Chunk | Bibliotecas | Est. |
|-------|-------------|------|
| `vendor-animation` | framer-motion | ~200 KB |
| `vendor-editor` | react-quill | ~150 KB |
| `vendor-barcode` | @zxing/browser, @zxing/library | ~120 KB |
| `vendor-i18n` | i18next, react-i18next, i18next-browser-languagedetector | ~80 KB |
| `vendor-markdown` | react-markdown, dompurify | ~80 KB |
| `vendor-core` (restante) | date-fns, browser-image-compression, qrcode.react, idb | < 100 KB |

### Ajuste do warning limit

Reduzir `chunkSizeWarningLimit` para 400 KB para detectar futuros excessos.

## Risks / Trade-offs

- **[Cache]** Mais chunks = mais requests HTTP paralelos (tipicamente 6 chunks adicionais) → Mitigação: HTTP/2 multiplexing lida bem com múltiplos requests pequenos
- **[Over-splitting]** Dividir demais aumenta overhead de requests → Mitigação: manter pelo menos ~50 KB por chunk; todos os novos chunks estão bem acima disso
