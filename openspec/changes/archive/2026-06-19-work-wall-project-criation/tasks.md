## 1. Banco de Dados (Migration)

- [x] 1.1 Criar arquivo de migração `supabase/migrations/<timestamp>_create_projects_table.sql`.
- [x] 1.2 No arquivo de migração, criar tabela `projects` (`id` UUID, `name` TEXT, `description` TEXT, `created_by` UUID, `created_at` TIMESTAMPTZ) e habilitar RLS.
- [x] 1.3 Adicionar coluna `project_id` na tabela `activities` (`REFERENCES projects(id) ON DELETE SET NULL`).
- [x] 1.4 Adicionar políticas RLS de Select (todos veem) e Insert (apenas autenticados criam) na tabela `projects`.

## 2. Backend (Edge Function `api-work`)

- [x] 2.1 Adicionar case `fetchProjects` no `api-work/index.ts` para retornar todos os projetos ordenados por nome.
- [x] 2.2 Adicionar case `createProject` no `api-work/index.ts` para inserir um projeto no banco.
- [x] 2.3 Modificar `fetchActivities` para aceitar filtro opcional `projectId` (ex: se recebido no params, aplicar `.eq('project_id', projectId)`).
- [x] 2.4 Modificar `createActivity` e `updateActivity` para aceitarem e salvarem o campo `project_id`.

## 3. Frontend (UI Integration)

- [x] 3.1 Na página `WorkWall.tsx`, adicionar estado para lista de projetos e `selectedProjectId`, carregando os projetos no `useEffect`.
- [x] 3.2 Na página `WorkWall.tsx`, renderizar um `Select` ou `Autocomplete` para filtrar atividades por projeto e passar esse filtro para a busca das atividades.
- [x] 3.3 No componente de formulário de demanda (ex: `RegisterWork.tsx` ou similar), carregar e exibir um dropdown opcional para o campo `project_id`.
- [x] 3.4 No mesmo formulário, adicionar um botão/dialog para "Novo Projeto" que chama `createProject` e auto-seleciona o projeto recém-criado.
- [x] 3.5 Validar o fluxo completo ponta-a-ponta rodando o ambiente localmente.
