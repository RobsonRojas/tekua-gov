## Why

O Mural de Trabalho (WorkWall) reúne demandas, tarefas e contribuições sem nenhuma noção de **área de atuação** (permacultura, tecnologia, saúde etc.). Isso dificulta encontrar itens por tema e enxergar como o trabalho se distribui entre as áreas da comunidade. Categorizar cada item e poder filtrar por área torna o mural navegável por tema, de forma independente do projeto ao qual o item pertence.

## What Changes

- Nova tabela de referência `work_categories` (áreas de atuação) com `slug` estável e nome i18n `{pt, en}`, semeada com as áreas iniciais (ex.: permacultura, tecnologia, saúde, educação, agricultura, cultura, infraestrutura, outros) e RLS com leitura pública.
- Nova coluna opcional `activities.category_id` (FK para `work_categories`, `ON DELETE SET NULL`) — **uma área por item**; itens sem área permanecem válidos (`NULL`).
- `fetchActivities` passa a aceitar `categoryId`, aplica o filtro no servidor e retorna a área (`work_categories(id, name)`) junto de cada atividade.
- `createActivity` e a RPC `submit_activity` passam a persistir `category_id`; nova ação `fetchWorkCategories` lista as áreas ordenadas por `sort_order`.
- Novo filtro "Área de Atuação" no `WorkFilters`, independente do filtro de Projeto e combinável com os demais (executor, demandante, tipo).
- Seleção opcional de área nos formulários de criação (demandas, tarefas e contribuições) e exibição da área nos cards e no detalhe da atividade.
- Novas chaves de i18n para os rótulos de filtro/formulário.

## Capabilities

### New Capabilities

- `work-categorization`: áreas de atuação para as atividades do Mural — catálogo de referência traduzível, atribuição opcional de uma área por atividade, filtro independente no Mural e exibição da área nos cards/detalhe.

### Modified Capabilities

<!-- Nenhuma capacidade existente tem requirements alterados: a mudança é puramente aditiva. -->

## Impact

- **Banco de dados:** nova migração criando `work_categories`, adicionando `activities.category_id` e atualizando a RPC `submit_activity` (novo parâmetro `p_category_id UUID DEFAULT NULL`).
- **Edge Function:** `supabase/functions/api-work` — `fetchActivities`, `createActivity`, `submitActivity` e a nova ação `fetchWorkCategories`.
- **Frontend:** `src/components/WorkFilters.tsx`, `src/pages/WorkWall.tsx`, `src/components/ActivityCard.tsx`, `src/pages/TaskDetail.tsx`, `src/pages/CreateDemand.tsx`, `src/pages/CreateTask.tsx`, `src/pages/RegisterWork.tsx` e arquivos de i18n.
- **Retrocompatibilidade:** coluna nullable, `DEFAULT NULL` na RPC e `ON DELETE SET NULL` preservam atividades e chamadas existentes sem quebra.
