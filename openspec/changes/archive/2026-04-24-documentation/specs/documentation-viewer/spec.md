## ADDED Requirements

### Requirement: Consulta de Documentação Oficial
O sistema SHALL prover aos membros um local centralizado para consultar as regras e registros da associação.

#### Scenario: Acesso via Dashboard
- **WHEN** o usuário autenticado clica em "Acessar" no card de Documentação na Home.
- **THEN** o sistema redireciona para a página `/documentation`.

#### Scenario: Visualização de Documento
- **WHEN** o usuário seleciona um documento da lista e clica em "Visualizar".
- **THEN** o sistema gera uma URL assinada do Supabase Storage e abre o documento em uma nova aba.

### Requirement: Filtros e Organização
O sistema SHALL organizar os documentos para facilitar a localização.

#### Scenario: Filtragem por Categoria
- **WHEN** o usuário seleciona a categoria "Estatutos" no menu lateral ou filtro.
- **THEN** a lista é filtrada para exibir apenas o estatuto vigente e suas emendas.

#### Scenario: Busca por Texto
- **WHEN** o usuário digita no campo de busca (ex: "Ata 2024").
- **THEN** o sistema filtra a lista em tempo real pelos títulos dos documentos correspondentes.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.
