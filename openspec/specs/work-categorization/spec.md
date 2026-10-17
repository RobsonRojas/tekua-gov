# work-categorization Specification

## Purpose

Permite classificar as atividades do Mural de Trabalho por **área de atuação** (permacultura, tecnologia, saúde etc.), atribuindo uma área por item e oferecendo um filtro por área independente do filtro de projeto.

## Requirements

### Requirement: Catálogo de áreas de atuação

O sistema SHALL disponibilizar um catálogo de áreas de atuação (`work_categories`) com identificador estável (`slug`) e nome traduzível em português e inglês, pré-populado com as áreas iniciais e acessível a todos os usuários autenticados.

#### Scenario: Listar áreas de atuação

- **WHEN** um usuário autenticado carrega o Mural de Trabalho ou um formulário de criação de atividade
- **THEN** o sistema disponibiliza as áreas de atuação com nomes traduzidos conforme o idioma da interface, ordenadas de forma estável

#### Scenario: Área de atuação ausente

- **WHEN** uma atividade não possui área de atuação associada
- **THEN** o sistema a trata como "sem categoria", sem impedir sua criação ou exibição

### Requirement: Atribuição de uma área por atividade

O sistema SHALL permitir que o usuário selecione opcionalmente **uma** área de atuação ao criar uma demanda, tarefa ou contribuição e SHALL persistir essa escolha junto à atividade.

#### Scenario: Criar atividade com área

- **WHEN** um usuário cria uma demanda, tarefa ou contribuição e seleciona uma área de atuação
- **THEN** a atividade é criada com a área selecionada

#### Scenario: Criar atividade sem área

- **WHEN** um usuário cria uma atividade sem selecionar área de atuação
- **THEN** a atividade é criada sem área e permanece visível normalmente no mural

### Requirement: Filtro por área de atuação no Mural

O sistema SHALL oferecer, no Mural de Trabalho, um filtro por área de atuação próprio, independente do filtro de projeto e combinável com os demais filtros (executor, demandante e tipo).

#### Scenario: Filtrar atividades por área

- **WHEN** um usuário seleciona uma área de atuação no filtro do Mural
- **THEN** o mural exibe apenas as atividades daquela área

#### Scenario: Combinar área com projeto

- **WHEN** um usuário seleciona simultaneamente uma área de atuação e um projeto
- **THEN** o mural exibe apenas as atividades que satisfazem ambos os critérios

#### Scenario: Sem filtro de área

- **WHEN** nenhuma área de atuação está selecionada no filtro
- **THEN** o mural exibe as atividades de todas as áreas, incluindo as sem categoria

### Requirement: Exibição da área de atuação

O sistema SHALL exibir a área de atuação nos cards do Mural e no detalhe da atividade quando a atividade possuir uma área.

#### Scenario: Card com área

- **WHEN** uma atividade com área de atuação é exibida no Mural de Trabalho
- **THEN** o card mostra o nome da área traduzido conforme o idioma da interface

#### Scenario: Card sem área

- **WHEN** uma atividade sem área de atuação é exibida no Mural de Trabalho
- **THEN** o card não exibe indicador de área
