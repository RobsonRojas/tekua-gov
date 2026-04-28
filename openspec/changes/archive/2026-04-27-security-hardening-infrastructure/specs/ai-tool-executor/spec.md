## ADDED Requirements

### Requirement: Validação de Parâmetros de Ferramentas
O sistema SHALL validar rigorosamente todos os parâmetros fornecidos pelo modelo de IA para uma ferramenta antes de sua execução.

#### Scenario: Prevenção de estouro de limite em ferramenta
- **WHEN** O modelo de IA solicita a ferramenta `get_activity_history` com um parâmetro `limit` excessivo (ex: 1.000.000).
- **THEN** O sistema SHALL truncar ou rejeitar o parâmetro para um valor seguro pré-definido (ex: 20) antes de realizar a consulta.

### Requirement: Autorização em Tempo de Execução de Ferramentas
O sistema SHALL verificar se o usuário autenticado na sessão de chat possui permissões de leitura para os dados que a ferramenta está tentando acessar.

#### Scenario: Verificação de RLS em ferramentas de IA
- **WHEN** Uma ferramenta de IA é executada.
- **THEN** A execução SHALL utilizar o cliente Supabase com o token de autenticação do usuário, garantindo que as políticas de RLS do banco de dados sejam aplicadas à consulta.
