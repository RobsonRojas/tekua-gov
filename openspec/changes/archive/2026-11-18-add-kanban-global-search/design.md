## Context

`WorkWall.tsx` busca as atividades via `api-work/fetchActivities` (limite de 50, já com solicitante, executores, categoria, projeto e protocolo embutidos) e as distribui nas colunas em `getColumnActivities`. Os filtros existentes (`WorkFilters.tsx`) alteram a consulta ao servidor e são persistidos em `localStorage`. Veja proposal.md.

## Goals / Non-Goals

**Goals:**
- Pesquisa instantânea sobre os cartões já carregados, em todas as colunas.
- Contadores consistentes com o resultado.

**Non-Goals:**
- Pesquisa no servidor ou paginação além dos 50 itens carregados.
- Busca por relevância/fuzzy, destaque do termo nos cartões.
- Persistência do texto pesquisado entre sessões.

## Decisions

- **Filtragem no cliente, não na API.** Os dados já estão em memória; filtrar localmente evita nova requisição a cada tecla e mantém a chave de cache (`JSON.stringify(filters)`) estável. Alternativa (parâmetro `search` em `fetchActivities` com `ilike`) exigiria mudar a edge function e não alcançaria nomes de relacionamentos facilmente.
- **Estado separado de `WorkFilterValues`.** O texto fica em estado próprio no `WorkWall` (`searchTerm`), passado ao `WorkFilters` por props (`searchValue`/`onSearchChange`). Assim não entra na chave de cache/consulta nem em `localStorage`. O botão "Limpar" do `WorkFilters` também chama `onSearchChange('')`.
- **Debounce curto (~250 ms)** no valor aplicado, mantendo o campo responsivo.
- **Normalização:** `toLowerCase` + `normalize('NFD')` removendo diacríticos. O texto indexado de cada atividade concatena título, descrição, solicitante, worker, executores, projeto, categoria (`name.pt/en`), protocolo e status traduzido. Termos são separados por espaço e todos precisam casar.
- **Aplicação em um único ponto:** um `useMemo` produz a lista filtrada, usada por `getColumnActivities` e, por consequência, por contadores de colunas e chips.
- **Posição na UI:** campo `TextField` pequeno com ícone de busca e botão de limpar, na linha dos filtros principais (largura total no mobile).

## Risks / Trade-offs

- [Só busca nos 50 itens carregados] → Documentado como não-objetivo; limite pode ser revisto depois.
- [Cartão pode ter campos com formatos inesperados (nome nulo, `name` JSON)] → Helper de texto tolerante a `null`/`undefined`.
- [Novas chaves i18n ausentes em algum idioma] → Usar fallback em `t(..., 'Pesquisar')` e adicionar em pt e en.
