# edge-rate-limiting Specification

## Purpose
Prover uma infraestrutura de limitação de taxa (Rate Limiting) compartilhada entre todas as Edge Functions para prevenir abuso da API e garantir disponibilidade.

## Requirements

### Requirement: Rastreamento de Uso por Cliente
O sistema SHALL rastrear o número de requisições realizadas por um cliente (identificado por IP ou User ID) em uma tabela de auditoria de segurança.

#### Scenario: Registro de requisição no banco
- **WHEN** Uma Edge Function crítica é invocada.
- **THEN** O sistema SHALL registrar uma entrada na tabela `security_rate_limits` com o identificador do cliente e o carimbo de data/hora atual.

### Requirement: Bloqueio de Excesso de Requisições
O sistema SHALL comparar o volume de requisições recentes com limites pré-configurados e bloquear o acesso se o limite for excedido.

#### Scenario: Resposta 429 (Too Many Requests)
- **GIVEN** Um limite de 10 requisições por minuto para a API de IA.
- **WHEN** Um usuário realiza a 11ª requisição dentro do mesmo minuto.
- **THEN** A Edge Function SHALL retornar imediatamente o erro HTTP 429 sem processar a lógica de negócio ou invocar o LLM.

### Requirement: Limpeza Automática de Logs de Rate Limit
O sistema SHALL remover logs antigos de rate limit para manter a performance das consultas de verificação.

#### Scenario: Execução de limpeza periódica
- **WHEN** O cron job de segurança é executado.
- **THEN** O sistema SHALL remover todos os registros da tabela `security_rate_limits` anteriores ao intervalo de monitoramento (ex: mais de 1 hora).
