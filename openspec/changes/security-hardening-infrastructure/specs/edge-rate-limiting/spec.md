## ADDED Requirements

### Requirement: Limitação de Taxa em Edge Functions
O sistema SHALL implementar um mecanismo de rate limiting para todas as Edge Functions expostas publicamente para evitar abuso e ataques de negação de serviço.

#### Scenario: Bloqueio de excesso de requisições
- **WHEN** Um usuário ou endereço IP excede o limite de 60 requisições por minuto em uma Edge Function específica.
- **THEN** O sistema SHALL retornar um erro HTTP 429 (Too Many Requests).
- **AND** O sistema SHALL registrar a tentativa de excesso nos logs de segurança.

### Requirement: Identificação de Origem Confiável
O mecanismo de rate limiting SHALL diferenciar entre usuários autenticados (por User ID) e usuários anônimos (por IP) para aplicar políticas de limites distintas.

#### Scenario: Limite diferenciado para membros
- **WHEN** Um membro autenticado realiza requisições.
- **THEN** O sistema SHALL aplicar um limite superior (ex: 120 req/min) em comparação a usuários não autenticados.
