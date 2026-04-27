## ADDED Requirements

### Requirement: Verificação de Consentimento LGPD
O fluxo de autenticação SHALL verificar se o usuário possui um consentimento de privacidade válido e atualizado antes de conceder acesso total ao sistema.

#### Scenario: Bloqueio por falta de consentimento
- **GIVEN** que o usuário realizou login com sucesso.
- **WHEN** o sistema verifica que os termos atuais não foram aceitos.
- **THEN** o sistema SHALL redirecionar ou manter o usuário em um estado de "Aguardando Consentimento" até que os termos sejam aceitos.
