## ADDED Requirements

### Requirement: Persistência de Histórico de Chat do Usuário
O sistema MUST persistir o histórico de mensagens trocadas entre o usuário autenticado e o agente de Justiça Restaurativa.

#### Scenario: Usuário retorna ao chat
- **WHEN** o usuário acessa a página do chat após ter interagido anteriormente
- **THEN** o sistema carrega o histórico de mensagens passadas e as exibe na interface, retomando o contexto

#### Scenario: Usuário envia nova mensagem
- **WHEN** o usuário envia uma nova mensagem no chat
- **THEN** o sistema grava a mensagem do usuário e, subsequentemente, a resposta do agente no histórico persistido
