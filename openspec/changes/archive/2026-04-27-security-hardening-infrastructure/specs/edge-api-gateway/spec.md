## ADDED Requirements

### Requirement: Proteção de Negação de Serviço (DDoS)
O gateway de API SHALL implementar limites de taxa (rate limiting) para todas as chamadas de funções de borda para proteger contra exaustão de recursos.

#### Scenario: Ativação do rate limit no gateway
- **WHEN** Uma origem (IP ou User ID) atinge o limite máximo de requisições em um intervalo de tempo definido.
- **THEN** O gateway SHALL rejeitar requisições subsequentes com o código HTTP 429 até que o intervalo expire.

### Requirement: Cabeçalhos de Resposta de Segurança
Todas as respostas enviadas pelo gateway de API SHALL incluir cabeçalhos de segurança configurados para mitigar ataques comuns de navegador.

#### Scenario: Verificação de cabeçalhos na resposta
- **WHEN** Uma Edge Function retorna uma resposta ao cliente.
- **THEN** A resposta SHALL conter cabeçalhos como `X-Content-Type-Options: nosniff` e `Strict-Transport-Security`.
