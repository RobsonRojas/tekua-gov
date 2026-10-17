## Context

See proposal.md for motivation. O sistema já possui um hub de notificações in-app e suporte inicial para PWA, mas precisamos evoluir a arquitetura para garantir o push real cross-platform. Utilizaremos o padrão Web Push (VAPID) com Service Workers para notificações na Web e PWA.

## Goals / Non-Goals

**Goals:**
- Definir como assinaturas (subscriptions) VAPID serão armazenadas para cada usuário.
- Utilizar a API padrão Web Push para o envio e recebimento de notificações (sem dependência de Firebase).
- Garantir a recepção do push em Web e PWA.

**Non-Goals:**
- Implementar push nativo para iOS/Android usando gateways proprietários neste momento (focaremos no suporte PWA universal que o iOS 16.4+ e Android já suportam via Web Push).
- Reformular o hub interno de notificações.

## Decisions

**Decision 1: Web Push nativo (VAPID)**
- **Rationale**: Ao utilizar o padrão aberto de Web Push, mantemos o sistema agnóstico e sem vendor lock-in (não dependemos do Google Firebase). O iOS suporta Web Push no Safari e o Android suporta via Chrome, garantindo o alcance mobile via PWA sem a necessidade de wrappers nativos.
- **Alternatives Considered**: Firebase Cloud Messaging (FCM). Rejeitado pelo usuário para evitar dependência de terceiros, priorizando o padrão VAPID puro.

**Decision 2: Tabela `push_subscriptions` adaptada para VAPID**
- **Rationale**: A tabela armazenará os campos `endpoint`, `p256dh` e `auth` (estruturas chave do objeto PushSubscription), além do `user_id`.

## Risks / Trade-offs

- **Risk**: Permissões de notificação podem ser negadas pelo usuário.
  **Mitigation**: Implementar um padrão "soft prompt" explicando o valor das notificações antes de solicitar a permissão do SO.
- **Risk**: Entrega de background no iOS PWA requer que a PWA seja instalada (Adicionada à Tela Inicial) e suporte apenas iOS 16.4+.
  **Mitigation**: Informar os usuários sobre a necessidade de adicionar à tela inicial no iOS para ativar as notificações push.
