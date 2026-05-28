## 1. Configuração do Vite

- [x] 1.1 Abrir o arquivo `vite.config.ts`.
- [x] 1.2 Adicionar/modificar a sessão de `build.rollupOptions.output` para incluir a função de `manualChunks`.
- [x] 1.3 Implementar a lógica de particionamento (if/else ou dicionário) dentro de `manualChunks` baseando-se no caminho de pastas vindos do `id` recebido (foco em agrupar `node_modules` como `mui`, `react`, `supabase`, `chart`/`recharts`).

## 2. Validação

- [x] 2.1 Rodar `npm run build` localmente e conferir o output no terminal de forma a confirmar que não há novos avisos "Some chunks are larger than 500 kB" e que o arquivo principal (`index-[hash].js`) reduziu significativamente seu tamanho.
