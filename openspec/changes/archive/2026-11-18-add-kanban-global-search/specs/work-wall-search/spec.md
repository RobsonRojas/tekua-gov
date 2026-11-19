## Purpose

Permitir que o membro localize rapidamente cartões no mural de trabalho digitando um texto livre, que é buscado em todas as colunas do quadro.

## ADDED Requirements

### Requirement: Campo de pesquisa geral no mural

O sistema SHALL exibir, na área de filtros do mural de trabalho, um campo de pesquisa de texto livre sempre visível, sem exigir a expansão dos filtros secundários.

#### Scenario: Campo visível ao abrir o mural

- **WHEN** um membro autenticado abre o mural de trabalho
- **THEN** o sistema SHALL exibir o campo de pesquisa junto aos filtros principais

### Requirement: Pesquisa em todas as colunas

O sistema SHALL filtrar os cartões de todas as colunas do mural para exibir apenas aqueles em que o texto pesquisado ocorre em algum dado visível ou descritivo da tarefa, incluindo título, descrição, nome do solicitante, nomes dos executores, projeto, área de atuação e status. A comparação MUST ignorar maiúsculas/minúsculas e acentos.

#### Scenario: Pesquisa por título

- **WHEN** o membro digita parte do título de uma tarefa
- **THEN** o sistema SHALL exibir apenas os cartões cujo conteúdo contém o texto, em qualquer coluna
- **AND** as colunas sem correspondências SHALL permanecer visíveis, vazias

#### Scenario: Pesquisa sem diferenciar acentos e caixa

- **WHEN** o membro digita "execucao" e existe um cartão com "Execução"
- **THEN** o cartão SHALL ser considerado correspondente

#### Scenario: Pesquisa por pessoa

- **WHEN** o membro digita o nome de um solicitante ou executor
- **THEN** o sistema SHALL exibir os cartões em que essa pessoa aparece como solicitante ou executora

#### Scenario: Múltiplos termos

- **WHEN** o membro digita mais de uma palavra
- **THEN** o sistema SHALL exibir somente os cartões que contêm todas as palavras, em qualquer ordem

#### Scenario: Nenhum resultado

- **WHEN** nenhum cartão corresponde ao texto digitado
- **THEN** o sistema SHALL exibir as colunas vazias com contadores zerados

### Requirement: Contadores refletem a pesquisa

O sistema SHALL atualizar os contadores das colunas e dos chips de navegação para refletir apenas os cartões que correspondem à pesquisa.

#### Scenario: Contadores durante a pesquisa

- **WHEN** a pesquisa reduz uma coluna de 8 para 2 cartões
- **THEN** o contador da coluna e o chip correspondente SHALL mostrar 2

### Requirement: Combinação com filtros e limpeza

A pesquisa SHALL ser aplicada em conjunto com os demais filtros do mural (condição E), e o sistema SHALL permitir limpá-la individualmente ou pelo botão geral de limpar filtros.

#### Scenario: Pesquisa combinada com filtro

- **WHEN** o membro seleciona um projeto e digita um texto
- **THEN** o sistema SHALL exibir apenas cartões do projeto que também contêm o texto

#### Scenario: Limpar a pesquisa

- **WHEN** o membro aciona o botão de limpar do campo ou o botão "Limpar" dos filtros
- **THEN** o sistema SHALL esvaziar o campo e exibir novamente todos os cartões permitidos pelos demais filtros

### Requirement: Pesquisa não interfere nas ações do quadro

A pesquisa SHALL ser apenas um filtro de exibição e MUST NOT alterar dados nem impedir ações sobre os cartões visíveis, como arrastar entre colunas ou abrir detalhes.

#### Scenario: Arrastar cartão durante a pesquisa

- **WHEN** a pesquisa está ativa e o membro arrasta um cartão visível para outra coluna permitida
- **THEN** a transição SHALL ocorrer normalmente
