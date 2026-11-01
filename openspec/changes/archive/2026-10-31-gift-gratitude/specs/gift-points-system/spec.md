## MODIFIED Requirements

### Requirement: Atribuição de Pontos de Dádiva
O sistema SHALL contabilizar "Pontos de Dádiva" para o provedor sempre que uma dádiva de sua autoria for utilizada por outro membro, registrando o histórico na tabela de usages. O registro de uso PODE incluir um agradecimento opcional (mensagem e emojis), conforme a spec `gift-gratitude`, sem alterar a contabilização dos pontos.

#### Scenario: Uso Declarado de Dádiva
- **WHEN** o usuário B clica no botão "Utilizar Dádiva" na oferta do usuário A.
- **THEN** o sistema SHALL registrar a transação na tabela `gift_usages` e incrementar atomicamente o saldo de `gift_points` da carteira do usuário A em 1 ponto.

#### Scenario: Uso Declarado de Dádiva com agradecimento
- **WHEN** o usuário B clica em "Utilizar Dádiva", preenche um agradecimento opcional e confirma.
- **THEN** o sistema SHALL registrar o uso com o agradecimento e incrementar o saldo de `gift_points` do usuário A em 1 ponto, da mesma forma que sem agradecimento.

#### Scenario: Visualização do Saldo de Pontos
- **WHEN** o usuário A acessa sua página de Carteira ou Perfil.
- **THEN** o sistema SHALL exibir o seu saldo acumulado de "Pontos de Dádiva" separadamente do saldo principal de "Surreais".
