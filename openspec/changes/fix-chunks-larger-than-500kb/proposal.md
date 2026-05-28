## Why

Durante o processo de build do Vite para produção, foi identificado um aviso: `(!) Some chunks are larger than 500 kB after minification.`. Um dos chunks do arquivo principal da aplicação chegou a 896.48 kB, e um chart (`BarChart`) chegou a 358.50 kB.
Isso impacta negativamente o tempo de carregamento inicial (First Contentful Paint e Time to Interactive) da aplicação web em conexões lentas. Resolver isso melhorará a performance da aplicação e eliminará o warning no processo de build/CI.

## What Changes

A configuração de build do Vite (`vite.config.ts`) será atualizada para utilizar um controle mais rigoroso de separação de código (code-splitting) por meio da opção `build.rollupOptions.output.manualChunks`.
Serão criados chunks dedicados para as maiores bibliotecas/vendor, como:
- `@mui` (Material-UI)
- `react` e `react-dom`
- `lucide-react`
- Bibliotecas de gráficos se existirem dependências isoladas (ex: recharts ou chart.js, possivelmente presentes em `BarChart`).

Isso dividirá os arquivos gigantes em pacotes menores, paralelizando o download no navegador e mantendo os chunks individuais abaixo do limite de alerta.

## Capabilities

### New Capabilities
- `chunk-optimization`: Separação de vendor/bibliotecas para melhoria de cache e tempo de carregamento.

### Modified Capabilities
- N/A

## Impact

- Impacto direto no `vite.config.ts`.
- Tamanho reduzido do chunk principal (`index-[hash].js`), transferindo as bibliotecas pesadas para os arquivos do tipo `vendor-mui-[hash].js` etc.
- Nenhuma alteração no código fonte da aplicação, apenas nas diretivas de build.
