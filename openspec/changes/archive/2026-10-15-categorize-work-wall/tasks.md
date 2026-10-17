## 1. Banco de dados (migração)

- [x] 1.1 Criar migração `add_work_categories.sql` com a tabela `work_categories (id UUID PK DEFAULT gen_random_uuid(), slug TEXT UNIQUE NOT NULL, name JSONB NOT NULL, sort_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())`.
- [x] 1.2 Habilitar RLS em `work_categories` e criar policy de SELECT pública ("Areas are viewable by everyone").
- [x] 1.3 Semear as áreas iniciais (`permacultura`, `tecnologia`, `saude`, `educacao`, `agricultura`, `cultura`, `infraestrutura`, `outros`) com `name` i18n `{pt, en}` e `sort_order`.
- [x] 1.4 Adicionar a coluna `activities.category_id UUID REFERENCES work_categories(id) ON DELETE SET NULL` (nullable).
- [x] 1.5 Atualizar a RPC `submit_activity` (`CREATE OR REPLACE FUNCTION`) com o novo parâmetro `p_category_id UUID DEFAULT NULL`, gravando `category_id` no INSERT e preservando a assinatura anterior e os grants.

## 2. Backend (Edge Function api-work)

- [x] 2.1 `fetchActivities`: aceitar `categoryId` nos params e aplicar `query.eq('category_id', categoryId)` quando informado.
- [x] 2.2 `fetchActivities`: incluir `category:work_categories(id, name)` no `select` para retornar a área junto à atividade.
- [x] 2.3 `createActivity`: aceitar `categoryId` e gravar `category_id` no INSERT.
- [x] 2.4 `submitActivity`: repassar `p_category_id` para a RPC `submit_activity`.
- [x] 2.5 Adicionar a ação `fetchWorkCategories` para listar as áreas ordenadas por `sort_order`.

## 3. Frontend: filtro no Mural

- [x] 3.1 `WorkFilters`: adicionar `categoryId` em `WorkFilterValues`, no estado e em `DEFAULT_FILTERS`; carregar as áreas (via `supabase.from('work_categories')`) e renderizar um `Select` "Área de Atuação" ao lado do filtro de Projeto.
- [x] 3.2 `WorkWall`: aplicar `filters.categoryId` na chamada de `fetchActivities`.
- [x] 3.3 `WorkFilters`: remover `categoryId` no botão "Limpar filtros".

## 4. Frontend: criação e exibição da área

- [x] 4.1 `CreateDemand`/`CreateTask`/`RegisterWork`: `Select` opcional de área, populado via `fetchWorkCategories`, enviando `categoryId` na criação.
- [x] 4.2 `ActivityCard`: incluir o chip de área (nome traduzido) no card do mural quando presente.
- [x] 4.3 `TaskDetail`: exibir a área da atividade no detalhe quando presente.

## 5. i18n

- [x] 5.1 Adicionar as chaves pt/en para rótulos de filtro e formulário (ex.: título do filtro "Área de Atuação", opção "Todas as áreas" e rótulo do campo nos formulários).

## 6. Verificação

- [x] 6.1 Rodar `npm run build` e a suíte de testes; confirmar que não há regressões novas.
- [x] 6.2 Checar a sintaxe da migração SQL e do TypeScript de `api-work` (via `node` + `ts.transpileModule`, pois Deno não está instalado).
- [x] 6.3 Rodar `openspec validate categorize-work-wall` e confirmar 0 issues.
