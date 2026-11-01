## Purpose

Oferecer, no mural de trabalho, um assistente de IA que explica como o mural funciona e ajuda o membro a criar demandas e tarefas por meio de conversa, sempre com confirmação explícita antes de qualquer gravação.

## ADDED Requirements

### Requirement: Acesso ao Assistente a partir do Mural
O sistema SHALL oferecer o assistente de IA diretamente na tela do mural de trabalho, para membros autenticados, sem exigir navegação para outra página.

#### Scenario: Abrir o assistente no mural
- **WHEN** um membro autenticado abre o mural de trabalho
- **THEN** o sistema SHALL exibir um ponto de entrada para o assistente
- **AND** ao acioná-lo, o assistente SHALL abrir com a conversa disponível sem perder o contexto da tela do mural

#### Scenario: Usuário não autenticado
- **WHEN** uma pessoa sem sessão tenta usar o assistente
- **THEN** o sistema SHALL solicitar o login antes de qualquer interação

### Requirement: Explicação do Funcionamento do Mural
O assistente SHALL explicar o funcionamento do mural de trabalho, incluindo o significado dos status das tarefas, como uma tarefa é assumida, como evidências são enviadas, como ocorre a confirmação e o pagamento da recompensa, e a diferença entre tarefa e demanda.

#### Scenario: Pergunta sobre o significado de um status
- **WHEN** o membro pergunta o que significa o status "pending_validation" ou "aguardando validação"
- **THEN** o assistente SHALL explicar o status em linguagem simples, no idioma ativo da interface

#### Scenario: Pergunta sobre como assumir uma tarefa
- **WHEN** o membro pergunta como assumir uma tarefa
- **THEN** o assistente SHALL descrever o passo a passo do mural para assumir a tarefa, sem executar a ação por conta do membro

#### Scenario: Informação fora do guia
- **WHEN** o membro pergunta algo que não consta no guia do mural nem nos documentos oficiais fornecidos
- **THEN** o assistente SHALL informar que não encontrou a informação, sem inventar regras

### Requirement: Criação Guiada de Demanda ou Tarefa
O assistente SHALL ajudar o membro a criar uma demanda ou uma tarefa por meio de conversa, coletando as informações necessárias e montando um rascunho antes de qualquer gravação.

#### Scenario: Criação de tarefa por conversa
- **WHEN** o membro diz que quer criar uma tarefa
- **THEN** o assistente SHALL perguntar as informações obrigatórias que faltam (título, descrição e recompensa) e as opcionais relevantes (categoria, método de validação, número de confirmações e executores)
- **AND** ao reunir as informações, SHALL montar um rascunho com todos os campos

#### Scenario: Informações obrigatórias ausentes
- **WHEN** o membro pede para criar uma atividade sem título, descrição ou recompensa positiva
- **THEN** o assistente SHALL pedir a informação faltante e SHALL NOT montar um rascunho válido até que ela seja fornecida

#### Scenario: Escolha entre demanda e tarefa
- **WHEN** a intenção do membro não deixa claro se é uma demanda (com beneficiário) ou uma tarefa
- **THEN** o assistente SHALL perguntar qual dos dois o membro quer criar antes de montar o rascunho

### Requirement: Confirmação Explícita Antes da Gravação
O sistema SHALL gravar uma demanda ou tarefa somente após o membro confirmar explicitamente o rascunho apresentado pela interface, e SHALL NOT gravar com base apenas em uma resposta do modelo.

#### Scenario: Rascunho aguardando confirmação
- **WHEN** o rascunho de uma atividade está completo
- **THEN** o sistema SHALL exibir o resumo de todos os campos com ações "Criar" e "Editar"
- **AND** nenhuma atividade SHALL ser gravada até que o membro acione "Criar"

#### Scenario: Membro cancela o rascunho
- **WHEN** o membro cancela o rascunho ou muda de assunto
- **THEN** nenhuma atividade SHALL ser gravada
- **AND** o rascunho descartado SHALL NOT aparecer no mural

#### Scenario: Texto do modelo tenta criar sem confirmação
- **WHEN** a resposta do modelo indica que a atividade foi criada, mas o membro não acionou "Criar"
- **THEN** o sistema SHALL NOT registrar a atividade
- **AND** SHALL exibir o rascunho para confirmação

### Requirement: Gravação com a Sessão do Próprio Membro
A criação confirmada SHALL ser realizada em nome do membro autenticado, pela mesma operação de criação de atividade usada pelas telas de criação, e SHALL aplicar as mesmas validações desse fluxo.

#### Scenario: Criação bem-sucedida
- **WHEN** o membro confirma um rascunho válido
- **THEN** o sistema SHALL criar a atividade com o membro como solicitante
- **AND** SHALL informar o sucesso e exibir o link para a atividade criada

#### Scenario: Validação recusada pelo backend
- **WHEN** o backend recusa a criação (por exemplo, recompensa inválida)
- **THEN** o sistema SHALL exibir o motivo da recusa no próprio rascunho
- **AND** SHALL manter o rascunho para correção, sem gravar nada

### Requirement: Escopo Restrito de Ações do Assistente
O assistente SHALL realizar apenas as ações de explicação e criação de demanda ou tarefa descritas nesta spec, e SHALL NOT assumir, confirmar, editar, excluir, transferir ou pagar atividades em nome do membro.

#### Scenario: Pedido fora do escopo
- **WHEN** o membro pede ao assistente para confirmar uma tarefa, transferir Surreals ou editar uma atividade existente
- **THEN** o assistente SHALL informar que essa ação não está disponível pelo assistente e SHALL indicar onde o membro pode fazê-la no mural
