## MODIFIED Requirements

### Requirement: Suporte Inteligente ao Membro
O sistema SHALL oferecer um assistente de IA capaz de sanar dúvidas sobre o ecossistema Tekuá de forma automatizada e precisa, mantendo o contexto histórico das interações passadas do usuário para continuidade. O sistema SHALL garantir que o formato de mensagens seja compatível com a API do Gemini e SHALL implementar fallback iterativo entre múltiplos modelos candidatos (ex: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash) em caso de falha (como 404 Model Not Found ou timeout), exibindo mensagem de erro amigável caso todos falhem.

#### Scenario: Consulta de Regras Institucionais
- **WHEN** o usuário pergunta ao Agente Tekuá IA: "O que diz o estatuto sobre votações?".
- **THEN** o sistema busca os documentos de categoria "Estatuto", fornece o contexto ao Gemini e exibe a resposta fundamentada no arquivo oficial.

#### Scenario: Orientação de Uso da Plataforma
- **WHEN** o usuário tem dúvida sobre "O que é um Surreal?".
- **THEN** o agente explica o conceito de economia de dádiva e as regras para ganhar e gastar a moeda virtual na plataforma.

#### Scenario: Continuidade de Conversa
- **WHEN** o usuário retorna ao Oráculo em uma nova sessão e faz referência a uma conversa anterior
- **THEN** o agente responde mantendo o contexto histórico recuperado da base de dados, sem tratar a interação como efêmera.

#### Scenario: Formatação do Histórico de Conversa
- **WHEN** uma mensagem é enviada ao modelo de IA
- **THEN** o sistema garante que o histórico sempre inicie com o "role" igual a "user".

#### Scenario: Fallback Automático de Modelos
- **WHEN** o modelo principal de IA falha ao responder (e.g., erro 404 Model Not Found, timeout, rate limit ou indisponibilidade)
- **THEN** o sistema tenta iterativamente usar o próximo modelo disponível na lista de fallbacks até obter uma resposta válida.

#### Scenario: Mensagem de Erro Informativa
- **WHEN** todos os modelos de IA disponíveis falham em responder após a iteração completa da lista de fallbacks
- **THEN** o sistema exibe uma mensagem amigável ao usuário informando sobre a instabilidade e sugerindo tentar novamente mais tarde.
