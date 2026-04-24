## ADDED Requirements

### Requirement: Registro Histórico Personalizado
O sistema SHALL prover uma linha do tempo (timeline) das ações pessoais do usuário dentro da plataforma.

#### Scenario: Visualização do Histórico no Perfil
- **WHEN** o usuário autenticado acessa a aba "Atividade" em seu perfil.
- **THEN** o sistema exibe uma lista cronológica das últimas 20 ações realizadas por ele.

#### Scenario: Registro Automático de Login
- **WHEN** o usuário realiza um login com sucesso.
- **THEN** um evento de tipo "Sessão Iniciada" é registrado na timeline dele.

### Requirement: Diversidade de Ações Auditáveis
O sistema SHALL registrar as interações principais com as ferramentas de governança e economia.

#### Scenario: Log de Votação
- **WHEN** o usuário confirma seu voto em uma pauta.
- **THEN** o sistema insere um log: "Você votou na pauta [Título]".

#### Scenario: Log de Tarefa Concluída
- **WHEN** a prova de trabalho de uma tarefa enviada pelo usuário é aprovada.
- **THEN** o sistema insere um log: "Sua prova para a tarefa [Título] foi aprovada e você recebeu [X] Surreais".

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
