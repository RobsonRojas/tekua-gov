# voting-system Specification

## Purpose
TBD - created by archiving change voting-system. Update Purpose after archive.
## Requirements
### Requirement: Plataforma de Deliberação
O sistema SHALL permitir o debate organizado e a tomada de decisão formal através de temas e votações. O editor de conteúdo DEVE ser compatível com ambientes React 19 para evitar falhas de renderização. Adicionalmente, a criação de um novo tema/pauta DEVE acionar o envio de notificações por email para os membros.

#### Scenario: Criação de Tema por Administrador com Notificação
- **WHEN** um administrador preenche o título e o conteúdo em um editor de texto rico estável e define o prazo de encerramento.
- **THEN** o sistema salva a pauta com status `open` ("Aberta"), um valor aceito pela restrição de status da tabela, e a disponibiliza para todos os membros sem causar falhas no navegador.
- **THEN** o sistema notifica os membros sobre a nova pauta criada através do envio de email.

#### Scenario: Debate em Texto Rico e Multilíngue
- **WHEN** um membro acessa a página de detalhes de um tema e insere um comentário no seu idioma.
- **THEN** o sistema armazena o comentário em um campo JSONB, utilizando o idioma atual como chave, e o exibe cronologicamente garantindo a integridade visual da página.

### Requirement: Sistema de Votação Formal
O sistema SHALL permitir que membros exerçam seu direito de voto de forma segura e única, apenas em pautas abertas. O registro do voto DEVE atualizar a marcação temporal (`updated_at`) sem quebras de schema ou incompatibilidades na persistência dos votos.

#### Scenario: Votação Única
- **WHEN** um membro autenticado seleciona uma opção (Sim, Não, Abstenção) e confirma seu voto.
- **THEN** o sistema registra o voto associado ao seu ID e atualiza `updated_at`, impedindo que ele vote novamente no mesmo tema e sem retornar erro 400 de coluna inexistente.

#### Scenario: Voto em Pauta Recém-Criada
- **WHEN** um membro vota em uma pauta com status `open`.
- **THEN** o sistema aceita o voto com sucesso.

#### Scenario: Voto em Pauta Encerrada
- **WHEN** um membro tenta votar em uma pauta com status `closed`.
- **THEN** o sistema rejeita o voto informando que a pauta não aceita mais votos.

#### Scenario: Apuração de Resultados
- **WHEN** uma votação é encerrada (tempo expirado ou ação do admin).
- **THEN** o sistema calcula as porcentagens de cada opção e exibe o resultado final para todos os membros.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Conteúdo em HTML Sanitizado
O conteúdo da pauta SHALL ser armazenado como HTML sanitizado no campo JSONB `content`, em vez de Markdown. A exibição DEVE renderizar o HTML com segurança.

#### Scenario: Criação de Pauta Salva como HTML
- **WHEN** um administrador cria uma pauta com o editor de texto rico
- **THEN** o conteúdo é salvo como HTML (ex: `<p>Texto com <strong>negrito</strong></p>`) na chave de idioma correspondente

#### Scenario: Exibição Renderiza HTML
- **WHEN** um membro visualiza uma pauta
- **THEN** o HTML é renderizado com segurança, exibindo a formatação visual sem tags visíveis

#### Scenario: Compatibilidade com Dados Existentes
- **WHEN** uma pauta criada anteriormente (Markdown) é visualizada
- **THEN** o sistema ainda renderiza corretamente o Markdown como texto formatado

### Requirement: Responsividade e Contenção de Layout na Descrição da Pauta
A área de exibição da descrição e conteúdo da pauta SHALL conter todo o texto, palavras longas, links e tags HTML dentro dos limites horizontais do card, impedindo vazamentos para fora da tela ou rompimento de layout.

#### Scenario: Descrição com Textos Longos ou Sequências Contínuas
- **WHEN** uma pauta possui palavras longas sem espaços, URLs ou texto extenso no corpo da pauta
- **THEN** o container aplica quebra de linha forçada (`break-word`) e limita a largura máxima a 100%, mantendo todo o conteúdo contido visualmente no card.

### Requirement: Feedback Detalhado no Envio de Comentários
Ao submeter um comentário ou resposta na pauta, o sistema SHALL prover tratamento de erros com exibição de mensagem clara e amigável em caso de falha.

#### Scenario: Erro ao Enviar Comentário
- **WHEN** a API recusa a gravação de um comentário ou ocorre uma falha na requisição
- **THEN** o sistema exibe feedback de erro com o motivo retornado pela API ou mensagem amigável no Snackbar/interface, sem travar silenciosamente.

