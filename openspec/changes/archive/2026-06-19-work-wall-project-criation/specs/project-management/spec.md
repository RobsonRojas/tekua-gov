## ADDED Requirements

### Requirement: Gestão de Projetos
O sistema SHALL permitir a criação, consulta e gerenciamento de Projetos como agregadores lógicos de tarefas no contexto da governança.

#### Scenario: Criar Projeto
- **WHEN** o usuário envia os dados (nome, descrição opcional) de um novo projeto via interface ou API de projetos (`api-work` action: `createProject`).
- **THEN** o sistema SHALL registrar a nova entidade na tabela `projects`, salvando o ID do usuário criador, e retornar o ID do projeto criado.

#### Scenario: Listar Projetos
- **WHEN** o usuário acessa o dropdown de projetos no mural ou no formulário de demandas.
- **THEN** o sistema SHALL listar todos os projetos ativos retornados pela API.
