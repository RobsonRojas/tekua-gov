## 1. Service Worker

- [x] 1.1 Aprimorar handler `push` em `public/custom-sw.js` para normalizar payload (suportar `title`/`body`/`url`/`data.url`), adicionar `icon`, `badge`, `tag`, `vibrate`, `renotify` e `requireInteraction` quando apropriado.
- [x] 1.2 Aprimorar handler `notificationclick` para focar janela existente em modo standalone ou abrir nova janela com URL correta (tratar relativas/absolutas).
- [x] 1.3 Adicionar handler `notificationclose` se necessário para logging/cleanup.
- [x] 1.4 Testar lógica com diferentes formatos de payload.

## 2. Notify Engine

- [x] 2.1 Revisar `supabase/functions/notify-engine/index.ts` para garantir que payload push seja compatível (`title`, `body`, `url`).
- [x] 2.2 Garantir que `data.url` seja sempre definido para navegação correta.

## 3. Frontend / Hooks

- [x] 3.1 Revisar `src/hooks/usePushNotifications.ts` para garantir funcionamento em PWA instalado.
- [x] 3.2 Verificar se há necessidade de ajustes no registro de SW.

## 4. Testes

- [x] 4.1 Adicionar/atualizar testes relacionados a push notifications.
- [x] 4.2 Validar comportamento em ambiente de desenvolvimento.

## 5. Verificação

- [x] 5.1 Rodar `npm run build` e `npm run lint`.
- [x] 5.2 Rodar `openspec validate pwa-push-system-notifications --strict`.
- [ ] 5.3 Testar em PWA instalado (Android Chrome) - notificação aparece como notificação do sistema e clique abre o app na rota correta.
