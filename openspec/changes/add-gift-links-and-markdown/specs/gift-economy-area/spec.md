## MODIFIED Requirements

### Requirement: Registro e Listagem de Dádivas
O sistema SHALL permitir que usuários cadastrem ofertas não-financeiras (dádivas) e as disponibilizem para a comunidade em uma área dedicada. O cadastro SHALL aceitar opcionalmente um link de acesso externo e SHALL tratar a descrição como texto Markdown.

#### Scenario: Cadastrar Dádiva
- **WHEN** o usuário preenche o formulário de nova dádiva com título e descrição.
- **THEN** o sistema SHALL armazenar a dádiva com status ativo e associar a autoria ao perfil do usuário.

#### Scenario: Cadastrar dádiva com link de acesso
- **WHEN** o usuário informa um endereço `http` ou `https` válido no campo opcional de link ao cadastrar a dádiva
- **THEN** o sistema SHALL armazenar esse link junto à dádiva e exibi-lo como recurso acessível na listagem e nos detalhes.

#### Scenario: Rejeitar link inválido
- **WHEN** o usuário informa no campo de link um valor que não é uma URL `http`/`https` válida
- **THEN** o sistema SHALL impedir o envio do formulário ou rejeitar o cadastro, apresentando indicação de erro, e SHALL não persistir a dádiva com esse valor.

#### Scenario: Cadastrar dádiva sem link
- **WHEN** o usuário cadastra uma dádiva deixando o campo de link vazio
- **THEN** o sistema SHALL aceitar o cadastro normalmente e SHALL tratar o link como ausente.

#### Scenario: Descrição em Markdown no cadastro
- **WHEN** o usuário digita a descrição da dádiva no formulário de cadastro
- **THEN** o sistema SHALL tratar o conteúdo como Markdown, oferecendo indicação da sintaxe suportada e pré-visualização do texto formatado antes do envio.

#### Scenario: Descrição em Markdown na listagem
- **WHEN** a Área de Dádivas exibe os cards de dádivas ativas
- **THEN** o sistema SHALL renderizar a descrição como Markdown sanitizado, removendo HTML cru e bloqueando URLs com protocolos perigosos.

#### Scenario: Explorar Dádivas
- **WHEN** o usuário acessa a página da Área de Dádivas.
- **THEN** o sistema SHALL listar todas as dádivas ativas, exibindo a descrição, nome de quem a está ofertando e seu avatar.

#### Scenario: Listagem com dados do provedor
- **WHEN** o sistema busca as dádivas ativas
- **THEN** o sistema SHALL incluir os dados do perfil do provedor (nome e avatar) na resposta, sem erro de schema

#### Scenario: Interface traduzida
- **WHEN** o usuário visualiza a Área de Dádivas
- **THEN** todos os títulos, botões, labels e placeholders DEVEM estar traduzidos conforme o idioma selecionado (pt ou en)

### Requirement: Visualizar Detalhes da Dádiva
O sistema SHALL permitir que os usuários cliquem em um card de dádiva listado na Área de Dádivas para visualizar todos os seus detalhes em uma visão expandida. A descrição SHALL ser apresentada como Markdown renderizado e contido dentro da área do card de detalhes, e a dádiva SHALL oferecer acesso ao seu link externo quando existir.

#### Scenario: Abrir detalhes de uma dádiva
- **WHEN** o usuário clica em um card de uma dádiva na Área de Dádivas
- **THEN** o sistema SHALL apresentar a visão detalhada dessa dádiva, contendo a descrição completa, os dados do perfil do provedor (nome e avatar) e o botão "Eu utilizei isso" (se aplicável).

#### Scenario: Descrição com Markdown nos detalhes
- **WHEN** o usuário visualiza os detalhes de uma dádiva cuja descrição contém sintaxe Markdown
- **THEN** o sistema SHALL renderizar o texto formatado (títulos, listas, ênfase, links, blocos de código) como Markdown sanitizado, sem executar HTML cru.

#### Scenario: Conter o texto na área do card de detalhes
- **WHEN** a descrição renderizada contém palavras longas, URLs extensas, blocos de código, imagens ou listas largas
- **THEN** o sistema SHALL ajustar a renderização para que todo o conteúdo permaneça dentro da largura da área do card de detalhes, sem estouro horizontal nem sobreposição aos demais elementos.

#### Scenario: Abrir link da dádiva em outra aba
- **WHEN** o usuário visualiza os detalhes de uma dádiva que possui link de acesso cadastrado
- **THEN** o sistema SHALL exibir um botão que abre esse link em uma nova aba do navegador, sem substituir a página da Área de Dádivas.

#### Scenario: Dádiva sem link
- **WHEN** o usuário visualiza os detalhes de uma dádiva que não possui link cadastrado
- **THEN** o sistema SHALL apresentar os detalhes sem o botão de abertura de link, mantendo os demais elementos.

#### Scenario: Links seguros
- **WHEN** a dádiva possui um link ou a descrição Markdown contém links
- **THEN** o sistema SHALL abrir os links em nova aba com proteção contra acesso a `window.opener` e SHALL não renderizar endereços com protocolos perigosos.
