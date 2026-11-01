## Why

O sistema já possui Web Push configurado (serviço `notify-engine`, tabela `push_subscriptions`, hook `usePushNotifications` e o handler `push` no `custom-sw.js`), mas quando o PWA é instalado no Android/iOS em modo `standalone`, as notificações push funcionam em segundo plano mas **não são apresentadas como notificações do sistema (notification tray)** de forma confiável em todos os casos, e o fluxo de clique nem sempre leva ao app aberto corretamente. Além disso, não existe um tratamento padronizado no Service Worker para garantir a exibição de notificações com ações, vibração, badge e navegação para dentro do PWA instalado. O objetivo é garantir que as notificações do sistema de notificações da plataforma sejam entregues e exibidas como notificações nativas do Android/iOS quando o app estiver instalado como PWA.

## What Changes

- Aprimorar o handler `push` no `public/custom-sw.js` para exibir notificações com `badge`, `icon`, `image` (opcional), `vibrate`, `requireInteraction` quando apropriado e dados consistentes para navegação.
- Aprimorar o handler `notificationclick` para focar/abrir o PWA instalado (modo standalone) ou abrir em nova janela, tratando URLs relativas e absolutas corretamente.
- Garantir que o payload enviado pelo `notify-engine` seja compatível com o formato esperado pelo SW (title/body/url/data).
- Adicionar suporte a `notificationclose` e garantir limpeza adequada.
- Opcionalmente adicionar ações nas notificações (ex. "Ver", "Fechar") quando suportado.
- Validar e ajustar o hook `usePushNotifications` para garantir inscrição correta em PWA instalado.
- Atualizar documentação/validação relacionada ao fluxo push.

## Capabilities

### New Capabilities

- `pwa-push-system-notifications`: Garantir que notificações push geradas pelo sistema sejam exibidas como notificações do sistema (Android/iOS) quando o app está instalado como PWA, com clique levando à rota correta dentro da aplicação.

### Modified Capabilities

- `cross-platform-push`: Reforçar a entrega para Web/PWA garantindo tratamento correto no Service Worker e navegação no app instalado.
- `notifications-hub`: Garantir que notificações in-app também gerem notificações push nativas quando o usuário tiver push habilitado e o app estiver em segundo plano/fechado ou instalado como PWA.

## Impact

- **Frontend/Service Worker**: `public/custom-sw.js` (handlers `push`, `notificationclick`, possivelmente `notificationclose`)
- **Backend**: `supabase/functions/notify-engine/index.ts` (verificar formato do payload push)
- **Hooks/Lib**: `src/hooks/usePushNotifications.ts` (ajustes mínimos se necessário)
- **Testes**: testes relacionados a push/SW
- **Sem impacto em**: migrações de banco, fluxos de negócio principais
