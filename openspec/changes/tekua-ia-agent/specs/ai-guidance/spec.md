## ADDED Requirements

### Requirement: Suporte Inteligente ao Membro
O sistema SHALL oferecer um assistente de IA capaz de sanar dúvidas sobre o ecossistema Tekuá de forma automatizada e precisa.

#### Scenario: Consulta de Regras Institucionais
- **WHEN** o usuário pergunta ao Agente Tekuá IA: "O que diz o estatuto sobre votações?".
- **THEN** o sistema busca os documentos de categoria "Estatuto", fornece o contexto ao Gemini e exibe a resposta fundamentada no arquivo oficial.

#### Scenario: Orientação de Uso da Plataforma
- **WHEN** o usuário tem dúvida sobre "O que é um Surreal?".
- **THEN** o agente explica o conceito de economia de dádiva e as regras para ganhar e gastar a moeda virtual na plataforma.

### Requirement: Personalidade e Segurança
O sistema SHALL assegurar que o agente mantenha uma postura ética e instrutiva.

#### Scenario: Resposta Fora de Escopo
- **WHEN** o usuário pergunta sobre temas irrelevantes (ex: cotação do dólar, política externa).
- **THEN** o agente educadamente informa que seu papel é auxiliar exclusivamente nos temas relativos à Associação Tekuá.

#### Scenario: Aviso de IA
- **WHEN** o chat é iniciado.
- **THEN** o sistema exibe um aviso claro de que as respostas são geradas por IA e os documentos oficiais devem ser consultados para validação legal.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
