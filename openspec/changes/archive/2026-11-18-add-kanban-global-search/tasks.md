## 1. Lógica de pesquisa

- [x] 1.1 Criar utilitário de normalização (minúsculas, sem acentos) e de montagem do texto pesquisável de uma atividade, tolerante a campos nulos
- [x] 1.2 Criar função que filtra atividades por termos (todos devem casar) e testá-la com casos: título, acento/caixa, pessoa, múltiplos termos, sem resultado

## 2. Interface

- [x] 2.1 Adicionar em `WorkFilters.tsx` o campo de pesquisa (ícone, botão de limpar) na linha de filtros principais, com props `searchValue` e `onSearchChange`
- [x] 2.2 Fazer o botão "Limpar" e o indicador de filtros ativos considerarem a pesquisa
- [x] 2.3 Adicionar textos i18n (placeholder e rótulo de limpar) em `src/locales/pt` e `src/locales/en`

## 3. Integração no mural

- [x] 3.1 Em `WorkWall.tsx`, criar estado `searchTerm` com debounce e passá-lo ao `WorkFilters`
- [x] 3.2 Aplicar o filtro em `getColumnActivities` via `useMemo`, de modo que colunas, contadores e chips reflitam o resultado
- [x] 3.3 Garantir que arrastar cartões e abrir detalhes funcionem com a pesquisa ativa

## 4. Verificação

- [x] 4.1 Rodar lint/build e validar manualmente no mural (desktop e mobile) os cenários da spec
