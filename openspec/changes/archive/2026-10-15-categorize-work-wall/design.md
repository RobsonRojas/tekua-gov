## Context

Ver `proposal.md` — Why. Estado atual relevante:

- As atividades vivem em `activities` (`type` = `task` | `contribution`; `project_id` FK opcional para `projects`).
- O Mural é um Kanban alimentado por `api-work.fetchActivities`, com filtros (`projectId`, `workerId`, `requesterId`, `type`) definidos em `WorkFilters` e persistidos em `localStorage`.
- A criação passa por `createActivity` (demandas/tarefas) e pela RPC `submit_activity` (contribuições).
- Não existe hoje nenhum conceito de categoria/área; o app usa i18n com JSONB `{pt, en}` em `title`/`description`.

## Goals / Non-Goals

**Goals:**
- Introduzir áreas de atuação como dado de referência reutilizável e traduzível.
- Categorizar cada atividade com no máximo uma área, opcionalmente.
- Oferecer um filtro de área **independente** e combinável no Mural.
- Manter retrocompatibilidade total: itens sem área continuam válidos.

**Non-Goals:**
- UI de administração de áreas (criação/edição pelo Conselho).
- Múltiplas áreas por item (N:N).
- Categorizar a entidade `projects` em si.
- Relatórios/analytics por área.

## Decisions

**1. Tabela de referência `work_categories` + FK em `activities`.**
- *Decisão:* nova tabela `work_categories (id, slug, name JSONB {pt,en}, sort_order, created_at)` semeada com as áreas iniciais; `activities.category_id UUID REFERENCES work_categories(id) ON DELETE SET NULL` (nullable, uma por item).
- *Alternativas:* coluna de texto livre em `activities` (sem tradução nem integridade, dificulta padronização); coluna JSONB `category` na própria atividade (duplica nomes, sem join para filtro); tabela N:N (fora do escopo "uma área por item").
- *Por quê:* segue a convenção de i18n JSONB do projeto, permite join/`eq` no filtro e centraliza os nomes para futura gestão (mesmo sem UI agora).

**2. Filtro server-side em `fetchActivities`.**
- *Decisão:* adicionar `categoryId` aos params de `fetchActivities`; `if (categoryId) query = query.eq('category_id', categoryId)`; incluir `category:work_categories(id, name)` no `select` para retorno e exibição.
- *Alternativa:* filtrar no cliente sobre a lista já carregada — rejeitado por quebrar a paginação/limite (`limit` já é aplicado no servidor) e divergir dos demais filtros.
- *Por quê:* o padrão atual já filtra por `projectId`/`workerId`/`type` no servidor; a área entra como mais uma cláusula, independente.

**3. Persistência da área nos dois caminhos de criação.**
- *Decisão:* `createActivity` aceita `categoryId` e grava `category_id`; a RPC `submit_activity` recebe novo parâmetro `p_category_id UUID DEFAULT NULL` (nova migração com `CREATE OR REPLACE FUNCTION`).
- *Alternativa:* atualizar a atividade após a RPC — rejeitado (round-trip extra e risco de corrida/estado inconsistente).
- *Por quê:* mantém consistência com a evolução anterior da própria RPC (ex.: quando recebeu `p_executor_ids`).

**4. Leitura das áreas.**
- *Decisão:* `work_categories` é visível a todos (RLS SELECT público). `WorkFilters` lê direto via `supabase.from('work_categories')` (mesmo padrão já usado para `projects`); os formulários de criação usam uma nova ação `fetchWorkCategories` em `api-work` (espelhando `fetchProjects`).
- *Por quê:* minimiza churn no componente de filtros já existente e mantém coerência com cada tela.

**5. Áreas iniciais (seed).**
- *Decisão:* semear um conjunto enxuto e genérico: `permacultura`, `tecnologia`, `saude`, `educacao`, `agricultura`, `cultura`, `infraestrutura`, `outros`. `slug` estável em ASCII; `name` i18n; `sort_order` definindo a exibição.
- *Por quê:* cobre os exemplos citados e um fallback; ajustável por migração futura sem mudar o esquema.

## Risks / Trade-offs

- **Áreas semeadas não refletirem a realidade da comunidade** → seed inclui `outros` e a lista é dado de referência editável via SQL; UI de admin fica como evolução futura.
- **Renomear/remover área altera exibição histórica** → `ON DELETE SET NULL` evita órfãos; aceitável por ser dado de referência.
- **Nova assinatura da RPC `submit_activity`** → usar `DEFAULT NULL` e `CREATE OR REPLACE`, preservando parâmetros anteriores e grants; itens sem área continuam funcionando.
- **Filtro combinado pode retornar vazio** → comportamento esperado (interseção); o botão "Limpar filtros" já existe em `WorkFilters`.

## Migration Plan

1. Migração nova (`supabase/migrations/<timestamp>_add_work_categories.sql`): cria `work_categories`, habilita RLS + policy de SELECT pública, faz o seed e adiciona `activities.category_id`.
2. Mesma migração (ou segunda): `CREATE OR REPLACE FUNCTION submit_activity(...)` com `p_category_id UUID DEFAULT NULL`.
3. Deploy da Edge Function `api-work` (filtro + persistência + `fetchWorkCategories`).
4. Deploy do frontend (filtro, formulários, chip no card, chaves i18n).
5. **Rollback:** reverter os deploys; para o banco, `DROP COLUMN activities.category_id` e `DROP TABLE work_categories` (dados de categoria não são críticos; itens permanecem).

## Open Questions

- Expor "Sem categoria" como opção explícita no filtro (em vez apenas do estado "Todas")? Pode ser adicionado depois sem alterar specs, abordagem ou tarefas.
