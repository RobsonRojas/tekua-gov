## Why

Ao criar uma pauta na área de votações e pautas, é essencial garantir que todos os membros da governança sejam notificados prontamente. O envio de um email automático assegura que os membros estejam cientes de novas pautas que exigem sua atenção e participação, aumentando o engajamento e a transparência no processo de decisão.

## What Changes

- **New Feature**: Integração de notificação por email quando uma nova pauta (agenda/topic) é criada na área de votações.
- O backend identificará os membros do conselho/usuários alvo e disparará um email notificando sobre a nova pauta, contendo o título, descrição e um link para acesso rápido.

## Capabilities

### New Capabilities
- `agenda-email-notifications`: Serviço ou fluxo dedicado ao envio de emails de notificação para membros quando novas pautas são criadas.

### Modified Capabilities
- `voting-system`: Adição do requisito de envio de notificação por email como parte do fluxo de criação de uma pauta.

## Impact

- **Backend**: Modificação no endpoint, serverless function ou trigger de banco de dados responsável por criar a pauta para invocar o envio de email.
- **Dependencies**: Utilização do serviço de envio de email existente na plataforma.
