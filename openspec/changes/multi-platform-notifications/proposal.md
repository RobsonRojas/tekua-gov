## Why

Atualmente o sistema possui notificações, mas precisamos garantir que os usuários sejam alertados de forma ativa em todos os dispositivos que utilizam (navegador web, dispositivo mobile nativo, e PWA). Isso aumenta o engajamento e garante que eventos importantes (tarefas, aprovações, mensagens) não sejam perdidos.

## What Changes

- Configuração e integração de Web Push Notifications (para navegadores e PWA).
- Configuração de push notifications para mobile (iOS/Android), possivelmente via Capacitor ou serviço similar se aplicável à arquitetura.
- Atualização do sistema de notificações para disparar mensagens nesses canais.

## Capabilities

### New Capabilities
- `cross-platform-push`: Configuração e envio de notificações push multiplataforma (Web, PWA e Mobile).

### Modified Capabilities
- `notifications`: Atualizado para disparar alertas não apenas no hub interno da aplicação, mas também via push notifications cross-platform.

## Impact

- Frontend: Service workers do PWA, permissões de notificação do navegador, plugins mobile.
- Backend: Serviço de envio de push notifications (Firebase Cloud Messaging, Web Push, etc) e armazenamento de tokens de dispositivos dos usuários.
