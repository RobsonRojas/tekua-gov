## Why

Atualmente, o "Work Wall" exibe todas as tarefas (activities) sem um nível superior de organização hierárquica. Com o crescimento da comunidade, torna-se essencial agrupar tarefas sob "Projetos" maiores. Isso soluciona o problema de desorganização visual e facilita a coordenação de esforços voltados para um mesmo objetivo ou entregável maior.

## What Changes

- **Criação de Projetos**: Formulário e interface para criar novos projetos na plataforma.
- **Associação de Tarefas**: Opcionalmente, ao criar ou editar uma demanda (activity), o usuário poderá vinculá-la a um projeto existente.
- **Novo Modelo de Dados**: Criação de tabela `projects` e adição de `project_id` na tabela `activities`.
- **Filtro no Mural de Trabalho**: Adição de um seletor no "Work Wall" para filtrar as tarefas visíveis por um projeto específico.

## Capabilities

### New Capabilities
- `project-management`: Criação, leitura e gerenciamento da nova entidade "Projeto" (tabela, rotas da API, e formulário de criação).

### Modified Capabilities
- `work-registration`: O formulário de registro de atividades passará a exibir um dropdown opcional para associar a atividade a um projeto.
- `work-wall-responsive-navigation`: O mural passará a ter um filtro superior de visualização por projeto.

## Impact

- Impacta a base de dados (novas migrations requeridas).
- Impacta o formulário de "Nova Demanda".
- Impacta a página `WorkWall.tsx` do frontend (inserção do filtro).
