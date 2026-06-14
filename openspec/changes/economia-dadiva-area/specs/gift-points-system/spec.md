## ADDED Requirements

### Requirement: Atribuição de Pontos de Dádiva
O sistema SHALL contabilizar "Pontos de Dádiva" para o provedor sempre que uma dádiva de sua autoria for utilizada por outro membro, registrando o histórico na tabela de usages.

#### Scenario: Uso Declarado de Dádiva
- **WHEN** o usuário B clica no botão "Utilizar Dádiva" na oferta do usuário A.
- **THEN** o sistema SHALL registrar a transação na tabela `gift_usages` e incrementar atomicamente o saldo de `gift_points` da carteira do usuário A em 1 ponto.

#### Scenario: Visualização do Saldo de Pontos
- **WHEN** o usuário A acessa sua página de Carteira ou Perfil.
- **THEN** o sistema SHALL exibir o seu saldo acumulado de "Pontos de Dádiva" separadamente do saldo principal de "Surreais".
