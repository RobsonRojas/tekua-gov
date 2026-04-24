# platform-evolution Specification

## Purpose
TBD - created by archiving change platform-evolution-suite. Update Purpose after archive.
## Requirements
### Requirement: Registro de Auditoria Imutável
O sistema **SHALL** registrar todas as alterações de balanço e status de governança em uma tabela de auditoria protegida.

#### Scenario: Registro de alteração de balanço
- **WHEN** Um administrador transfere créditos para um usuário.
- **THEN** Um registro é inserido na tabela `audit_logs` contendo o ator, o alvo e o valor alterado.

### Requirement: Período de Carência para Payouts
Créditos ganhos através de validação de tarefas **SHALL** permanecer bloqueados por um período de 24 horas.

#### Scenario: Saldo pendente após validação
- **WHEN** Uma atividade é validada.
- **THEN** O valor do payout é creditado com uma data de liberação (`available_at`) futura.
- **THEN** O saldo disponível para transferência não aumenta imediatamente.

### Requirement: Proxy Seguro para Assistente IA
Todas as comunicações com o modelo de IA **SHALL** passar por um gateway seguro no servidor.

#### Scenario: Interação protegida com IA
- **WHEN** O usuário envia uma mensagem no chat da IA.
- **THEN** A requisição é processada por uma Edge Function que injeta diretrizes de segurança antes de consultar o LLM.

