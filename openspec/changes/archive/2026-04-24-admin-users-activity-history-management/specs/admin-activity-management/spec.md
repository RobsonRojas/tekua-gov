## ADDED Requirements

### Requirement: Central de Auditoria Global
O portal SHALL fornecer aos administradores uma interface para monitorar todas as interações de todos os membros.

#### Scenario: Consulta de Histórico Geral
- **WHEN** um usuário com papel de administrador acessa `/admin/activity`.
- **THEN** o sistema SHALL exibir uma tabela cronológica contendo Nome do Usuário, Email, Ação Realizada e Data/Hora.

#### Scenario: Filtro por Usuário Específico
- **WHEN** o administrador digita o nome de um membro no campo de filtro de usuário.
- **THEN** o sistema SHALL filtrar a lista para exibir exclusivamente as ações realizadas por aquele membro.

### Requirement: Análise e Dashboard de Engajamento
O sistema SHALL prover visualizações consolidadas para suporte à tomada de decisão administrativa.

#### Scenario: Gráfico de Atividade Diária
- **WHEN** o administrador visualiza a página de auditoria.
- **THEN** o sistema SHALL exibir um gráfico de barras ou linhas mostrando o volume total de atividades por dia nos últimos 30 dias.

#### Scenario: Resumo por Categoria de Ação
- **WHEN** o administrador filtra as atividades por "Votação".
- **THEN** o sistema SHALL exibir um sumário do total de votos registrados no período selecionado.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
