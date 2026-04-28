# ai-tool-executor Specification

## Purpose
TBD - created by archiving change ai-agent-capabilities. Update Purpose after archive.
## Requirements
### Requirement: Execução de Ferramentas de Consulta
O sistema **SHALL** permitir que o modelo de IA solicite a execução de ferramentas de consulta pré-definidas para obter dados em tempo real.

#### Scenario: Consulta de saldo via IA
- **WHEN** O usuário pergunta "Qual meu saldo disponível?".
- **THEN** O proxy de IA identifica a intenção e executa a ferramenta `get_user_balance`.
- **AND** O resultado da ferramenta é fornecido ao LLM para compor a resposta final ao usuário.

### Requirement: Restrição de Ferramentas a Somente Leitura
Nesta fase, o sistema **MUST** garantir que nenhuma ferramenta executada pela IA possa realizar alterações no estado do banco de dados (escrita).

#### Scenario: Tentativa de transferência via IA
- **WHEN** O usuário solicita "Transfira 10 Surreals para o João".
- **THEN** O agente informa educadamente que ainda não possui permissão para realizar transações financeiras diretamente.

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

### Requirement: AI Error Resilience & Diagnostics
The system SHALL handle AI service failures gracefully and provide diagnostic information to administrators while maintaining a clean user experience.

#### Scenario: AI Service Unavailable (Missing API Key)
- **WHEN** the `ai-handler` is invoked and the `GEMINI_API_KEY` is missing.
- **THEN** the system SHALL return a clear 500 error code with a descriptive message in the logs and a fallback message for the user.

#### Scenario: Streaming Response Error
- **WHEN** an error occurs during the streaming of an AI response.
- **THEN** the system SHALL emit an `error` event in the event-stream and the frontend SHALL display an appropriate error alert instead of hanging.

