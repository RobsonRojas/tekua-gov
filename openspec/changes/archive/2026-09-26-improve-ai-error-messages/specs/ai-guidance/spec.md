## ADDED Requirements

### Requirement: Sanitização de Erros da IA
O sistema SHALL interceptar e sanitizar todos os erros técnicos (ex: HTTP 404, falhas do SDK, timeouts) gerados durante o processo de inferência ou fallback da IA, garantindo que detalhes da infraestrutura não sejam repassados ao cliente (usuário final).

#### Scenario: Falha sistêmica da IA
- **WHEN** todos os modelos de IA falham ou ocorre um erro irrecuperável durante a geração no `ai-handler`
- **THEN** o sistema SHALL retornar uma resposta padronizada, genérica e amigável (ex: "Nossos sistemas de IA estão temporariamente indisponíveis, por favor tente novamente mais tarde"), e logar os detalhes técnicos (stack traces, erros do SDK) apenas internamente no console.
