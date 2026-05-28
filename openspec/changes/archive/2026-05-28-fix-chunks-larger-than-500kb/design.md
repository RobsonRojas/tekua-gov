## Context

A configuração atual de build do Vite exporta grande parte das dependências em arquivos monolíticos (particularmente o `index.js`), o que causa avisos sobre chunks maiores que 500 kB. Essa abordagem prejudica o cache (pois qualquer pequena mudança no código refaz o arquivo gigantesco inteiro de vendor) e penaliza a inicialização da aplicação web devido a downloads seriais mais pesados.

## Goals / Non-Goals

**Goals:**
- Dividir os chunks gerados pelo Vite em pacotes de tamanho ótimo, com base em namespaces da pasta `node_modules`.
- Eliminar o warning "Some chunks are larger than 500 kB" no processo de CI / build local.
- Separar o React, as libs principais do MUI e utilitários como Recharts / Supabase / Lucide-React em chunks nomeados específicos para otimização de browser cache.

**Non-Goals:**
- Substituir bibliotecas existentes.
- Fazer refatoração (dynamic import / lazy loading) de rotas no código (iremos resolver estritamente a nível de empacotamento no vite/rollup primeiro).

## Decisions

**Implementação do manualChunks:**
Utilizaremos a configuração `build.rollupOptions.output.manualChunks` dentro do `vite.config.ts`.
A lógica de particionamento detectará inclusões advindas de `node_modules` e agrupará sob nomes específicos:
- `vendor-react`: para `react` e `react-dom`.
- `vendor-mui`: para pacotes da org `@mui` ou `emotion`.
- `vendor-icons`: para pacotes de ícones como `lucide-react`.
- `vendor-supabase`: para libs referentes ao Supabase Auth e DB.
- Os demais utilitários em `node_modules` formarão um chunk genérico `vendor-core` ou continuarão fluindo conforme heurística do Vite (se menores).

Essa abordagem divide o tráfego da rede, acelerando a hidratação e processamento no client-side.

## Risks / Trade-offs

- **[Risco] Muitos requisições pequenas:** Ao dividir exageradamente, o navegador pode demorar mais para negociar conexões (HTTP overhead).
  - *Mitigação:* Usaremos grupos grandes de dependências afins (como agrupar todo `@mui`) em vez de granular as centenas de submódulos do node. A performance com HTTP/2 mitiga naturalmente a penalidade de vários arquivos.
