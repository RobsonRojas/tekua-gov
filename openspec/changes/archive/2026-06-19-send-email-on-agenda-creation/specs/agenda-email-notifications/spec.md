## ADDED Requirements

### Requirement: Notificação por Email sobre Novas Pautas
O sistema SHALL enviar um email de notificação para todos os membros ativos sempre que uma nova pauta (agenda) for criada no sistema de votações.

#### Scenario: Envio de email após criação de pauta
- **WHEN** um administrador ou usuário com permissão cria uma nova pauta
- **THEN** o sistema identifica todos os membros elegíveis e despacha assincronamente um email contendo o título da pauta, breve descrição e um link para acesso à pauta.
- **THEN** o sistema não bloqueia ou atrasa a resposta da criação da pauta no cliente caso o disparo do email demore ou falhe isoladamente.
