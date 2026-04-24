# multilingual-content Specification

## Purpose
TBD - created by archiving change permitir-multiplos-idiomas. Update Purpose after archive.
## Requirements
### Requirement: Suporte a Conteúdo Multilíngue no DB (multilingual-content)

O sistema **DEVE (SHALL)** permitir que registros no banco de dados possuam traduções para campos textuais dinâmicos.

#### Scenario: Visualização de Conteúdo Traduzido
- **WHEN** o usuário acessa uma página com conteúdo vindo do banco de dados (ex: Nome do Projeto, Descrição).
- **THEN** o sistema verifica o idioma ativo do usuário.
- **THEN** tenta buscar a chave correspondente no objeto JSONB do registro (ex: `metadata->'description'->'en'`).
- **THEN** se a tradução solicitada não existir, cai para o idioma padrão (PT-BR).

#### Scenario: Edição de Conteúdo (Admin)
- **WHEN** um administrador edita um registro que suporta traduções.
- **THEN** o sistema deve prover campos de entrada para cada idioma suportado.
- **THEN** ao salvar, o banco de dados armazena o objeto estruturado com todas as versões de tradução fornecidas.

### Requirement: Cobertura de Testes Automatizados
O sistema SHALL possuir testes automatizados para garantir a estabilidade das funcionalidades.

#### Scenario: Execução de Testes Unitários
- **WHEN** os testes de unidade são executados (Vitest).
- **THEN** o sistema SHALL validar o comportamento isolado de componentes e funções.

#### Scenario: Execução de Testes de Integração
- **WHEN** os testes de fluxo (E2E) são executados (Playwright).
- **THEN** o sistema SHALL validar a integração entre frontend, rotas e Supabase.

