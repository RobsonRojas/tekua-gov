# ai-guidance Specification

## Purpose
TBD - created by archiving change tekua-ia-agent. Update Purpose after archive.
## Requirements
### Requirement: Suporte Inteligente ao Membro
O sistema SHALL oferecer um assistente de IA capaz de sanar dúvidas sobre o ecossistema Tekuá de forma automatizada, interativa e precisa, mantendo o contexto histórico das interações passadas do usuário para continuidade. O sistema SHALL citar de forma explícita as fontes oficiais e regulamentos (usando os documentos no contexto) nas respostas. O sistema SHALL garantir que o formato de mensagens seja compatível com a API do Gemini e SHALL implementar fallback iterativo entre múltiplos modelos candidatos, obtidos dinamicamente da própria API do Gemini, em caso de falha (como 404 Model Not Found ou timeout), exibindo mensagem de erro amigável caso todos falhem. A interface do sistema SHALL prover facilitadores de UX, como prompts sugeridos ("chips"), controles para interromper o fluxo de resposta (Stop Generation) e mecanismos de feedback do usuário para evolução da IA.

#### Scenario: Consulta de Regras Institucionais
- **WHEN** o usuário pergunta ao Agente Tekuá IA: "O que diz o estatuto sobre votações?".
- **THEN** o sistema busca os documentos de categoria "Estatuto", fornece o contexto ao Gemini e exibe a resposta fundamentada no arquivo oficial.

#### Scenario: Orientação de Uso da Plataforma
- **WHEN** o usuário tem dúvida sobre "O que é um Surreal?".
- **THEN** o agente explica o conceito de economia de dádiva e as regras para ganhar e gastar a moeda virtual na plataforma.

#### Scenario: Continuidade de Conversa
- **WHEN** o usuário retorna ao Oráculo em uma nova sessão e faz referência a uma conversa anterior
- **THEN** o agente responde mantendo o contexto histórico recuperado da base de dados, sem tratar a interação como efêmera.

#### Scenario: Citação Transparente de Fontes
- **WHEN** o agente responde a uma dúvida baseada em um trecho do Estatuto fornecido pelo contexto.
- **THEN** o agente finaliza a resposta com um texto similar a: "(Fonte: Estatuto da Associação Tekuá - Capítulo X)".

#### Scenario: Abortar Resposta Longa
- **WHEN** a IA está em processo de geração e streaming de uma resposta e o usuário clica no botão "Parar".
- **THEN** o frontend encerra imediatamente o stream, e a resposta parcial é mantida na tela, pronta para que o usuário faça uma nova pergunta.

#### Scenario: Feedback de Qualidade
- **WHEN** uma mensagem da IA é concluída, exibindo ícones de aprovação e reprovação (👍 / 👎).
- **THEN** o usuário clica em um deles e o sistema registra esse feedback silenciosamente (em background) vinculado à conversa, sem interromper o fluxo.

#### Scenario: Formatação do Histórico de Conversa
- **WHEN** uma mensagem é enviada ao modelo de IA
- **THEN** o sistema garante que o histórico sempre inicie com o "role" igual a "user".

#### Scenario: Fallback Automático de Modelos
- **WHEN** o modelo principal de IA falha ao responder (e.g., erro 404 Model Not Found, timeout, rate limit ou indisponibilidade)
- **THEN** o sistema tenta iterativamente usar o próximo modelo disponível na lista de fallbacks até obter uma resposta válida.

#### Scenario: Mensagem de Erro Informativa
- **WHEN** todos os modelos de IA disponíveis falham em responder após a iteração completa da lista de fallbacks
- **THEN** o sistema exibe uma mensagem amigável ao usuário informando sobre a instabilidade e sugerindo tentar novamente mais tarde.

### Requirement: Personalidade e Segurança
O sistema SHALL assegurar que o agente mantenha uma postura ética e instrutiva. A proteção contra injeções de comandos maliciosos SHALL ser assegurada pela parametrização da API de IA (Safety Settings) e instruções estritas no System Prompt, evitando validações heurísticas (RegEx) no backend. Toda sanitização de markdown (XSS) contra injeções web SHALL ser realizada estritamente na camada de renderização do Frontend, permitindo que a Edge Function processe o texto bruto de forma não-modificada.

#### Scenario: Resposta Fora de Escopo
- **WHEN** o usuário pergunta sobre temas irrelevantes (ex: cotação do dólar, política externa).
- **THEN** o agente educadamente informa que seu papel é auxiliar exclusivamente nos temas relativos à Associação Tekuá.

#### Scenario: Aviso de IA
- **WHEN** o chat é iniciado.
- **THEN** o sistema exibe um aviso claro de que as respostas são geradas por IA e os documentos oficiais devem ser consultados para validação legal.

#### Scenario: Prevenção de Injeção e Jailbreak
- **WHEN** o usuário envia instruções para o agente ignorar as regras de segurança e agir de forma maliciosa.
- **THEN** o modelo de IA, configurado com Safety Settings estritos e blindagem de prompt, rejeita ativamente o comando sem processá-lo.

#### Scenario: Proteção contra Cross-Site Scripting
- **WHEN** o modelo de IA responde contendo tags HTML maliciosas (ex: `<script>alert(1)</script>`) originadas de contexto ou resposta do chat.
- **THEN** o sistema frontend renderiza a mensagem expurgando o código executável através de sanitizadores de DOM (DOMPurify ou equivalente), exibindo a mensagem de forma segura.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

### Requirement: Session-Resilient AI Communication
The AI agent client SHALL validate and ensure a fresh authentication token before making requests to the AI edge function, and SHALL handle authentication failures gracefully with automatic recovery.

#### Scenario: Expired session triggers automatic refresh
- **WHEN** the user sends a message to the AI agent and the current session token is expired or null.
- **THEN** the system SHALL automatically attempt to refresh the session via Supabase auth refresh, and retry the request with the new token.

#### Scenario: Successful token refresh enables AI request
- **WHEN** a token refresh succeeds after detecting an expired session.
- **THEN** the AI request SHALL proceed normally with the refreshed token, and the user SHALL not see any error.

#### Scenario: Failed token refresh shows re-login prompt
- **WHEN** the session cannot be refreshed (e.g., refresh token also expired, user was logged out).
- **THEN** the system SHALL display a clear, localized error message informing the user their session has expired and prompting them to log in again.

#### Scenario: 401 response triggers single retry with refreshed token
- **WHEN** the AI edge function returns a 401 status code.
- **THEN** the system SHALL attempt exactly one token refresh and retry. If the retry also fails with 401, the system SHALL display the re-login error message.

#### Scenario: Missing token prevents request entirely
- **WHEN** no session token exists and refresh also yields no token.
- **THEN** the system SHALL NOT send the request and SHALL immediately display the re-login error message.

### Requirement: Sanitização de Erros da IA
O sistema SHALL interceptar e sanitizar todos os erros técnicos (ex: HTTP 404, falhas do SDK, timeouts) gerados durante o processo de inferência ou fallback da IA, garantindo que detalhes da infraestrutura não sejam repassados ao cliente (usuário final).

#### Scenario: Falha sistêmica da IA
- **WHEN** todos os modelos de IA falham ou ocorre um erro irrecuperável durante a geração no `ai-handler`
- **THEN** o sistema SHALL retornar uma resposta padronizada, genérica e amigável (ex: "Nossos sistemas de IA estão temporariamente indisponíveis, por favor tente novamente mais tarde"), e logar os detalhes técnicos (stack traces, erros do SDK) apenas internamente no console.

