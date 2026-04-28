## ADDED Requirements

### Requirement: Rótulos de Ações Comuns (common-actions)
O sistema **DEVE (SHALL)** fornecer traduções para ações comuns utilizadas em diversos componentes da interface através do namespace `common`.

#### Scenario: Rótulo de Envio em Português
- **GIVEN** que o idioma da interface é Português.
- **WHEN** um componente referencia as chaves `common.send` ou `common.sending`.
- **THEN** o sistema SHALL retornar "Enviar" e "Enviando...", respectivamente.

#### Scenario: Rótulo de Envio em Inglês
- **GIVEN** que o idioma da interface é Inglês.
- **WHEN** um componente referencia as chaves `common.send` ou `common.sending`.
- **THEN** o sistema SHALL retornar "Send" e "Sending...", respectivamente.
