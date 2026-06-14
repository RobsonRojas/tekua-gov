## Context

O sistema atual apresenta um mural de trabalho linear, listando todas as demandas criadas pela comunidade. Para dar suporte à governança de iniciativas maiores, precisamos introduzir o conceito de "Projetos" e permitir que tarefas (`activities`) sejam agrupadas dentro deles.

## Goals / Non-Goals

**Goals:**
- Criar a entidade de dados `projects` no banco.
- Permitir que usuários criem novos projetos.
- Permitir que tarefas (atividades) sejam associadas a projetos no momento da criação ou edição.
- Fornecer um filtro visual no mural de trabalho que filtre tarefas por projeto.

**Non-Goals:**
- Gestão complexa de projetos (ex: gráficos de Gantt, orçamentos isolados de projetos, permissões específicas por projeto). O modelo inicial é apenas de agrupamento (tagging estruturado).
- Hierarquia infinita de sub-projetos. O relacionamento será plano: uma tarefa pertence a um projeto (ou a nenhum).

## Decisions

- **Modelo de Dados:**
  - Tabela `projects` com os campos `id`, `name`, `description`, `created_by`, `created_at`.
  - Tabela `activities` ganhará a coluna `project_id` (foreign key referenciando `projects(id)` nullable).
  - *Rationale*: Abordagem padrão de relacionamento 1:N no banco de dados. Permite junções rápidas.
- **Backend (Edge Functions):**
  - O CRUD de projetos será adicionado à Edge Function `api-work`. O switch `action` ganhará as rotas `fetchProjects` e `createProject`.
  - As queries de listar atividades (`fetchActivities`) passarão a aceitar um parâmetro opcional `projectId` para filtrar as atividades vinculadas a este projeto no banco de dados.
- **Interface Gráfica (Frontend):**
  - **Mural de Trabalho**: Adicionar um `Select` do Material UI (ou similar) no topo da tela do `WorkWall.tsx` para carregar e selecionar projetos, acionando a refetch das tarefas com o filtro ativado.
  - **Formulário de Nova Demanda**: Adicionar um `Select` (ou `Autocomplete` se a lista crescer) opcional no form de atividade para escolher o projeto. Incluir um botão rápido "Criar Projeto" que abre um dialog secundário para registro de um projeto on-the-fly.

## Risks / Trade-offs

- **[Risco] Migração de Esquema** → Pode quebrar queries existentes se a tabela `activities` for alterada indevidamente. **Mitigação**: O `project_id` deve ser opcional (`nullable`) com um `DEFAULT NULL`, garantindo total compatibilidade com tarefas antigas que não possuem projetos.
- **[Risco] Escalabilidade Visual do Select** → Se o número de projetos crescer muito, um dropdown simples será ruim. **Mitigação**: Utilizar um `Autocomplete` da MUI no filtro do mural e no formulário.
