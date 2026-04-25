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

