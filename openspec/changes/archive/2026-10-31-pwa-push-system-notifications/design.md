## Context

Ver `proposal.md` — Why. Estado atual:

- `public/custom-sw.js` já possui handlers `push` e `notificationclick`, mas são minimalistas (apenas `title`, `body`, `icon`, `badge`, `vibrate`, `data.url`). Falta tratamento mais robusto para navegação em modo standalone e garantia de exibição nativa.
- `supabase/functions/notify-engine/index.ts` já envia Web Push via `web-push` com payload `JSON.stringify({ title: template.pushTitle, body: template.pushBody, url: template.link })`. O SW atual lê `data.url` — compatível.
- `src/hooks/usePushNotifications.ts` registra subscrições corretamente com VAPID.
- Existe spec `cross-platform-push` e `notifications-hub`. O objetivo é garantir que essas notificações apareçam como notificações do sistema em PWA instalado (Android/iOS).

## Goals / Non-Goals

**Goals:**
- Garantir exibição de notificações push como notificações do sistema quando o PWA estiver instalado (Android/iOS).
- Garantir que ao clicar na notificação, o app seja aberto/focado em modo standalone na rota correta.
- Padronizar o payload e o tratamento no Service Worker.

**Non-Goals:**
- Implementar APNs/FCM nativos (isso é coberto em parte pela spec `cross-platform-push`, mas o foco aqui é Web Push + PWA).
- Alterar o fluxo de notificações in-app.

## Decisions

**1. Aprimorar handlers do Service Worker**
- *Decisão:* Em `custom-sw.js`, melhorar `push` para normalizar payload (suportar `title`/`body`/`url`/`data.url`), adicionar `badge`, `icon`, `tag` (evitar duplicados), `renotify`, `requireInteraction` quando crítico, e `vibrate`. Em `notificationclick`, melhorar lógica para focar janela existente ou abrir nova, tratando URLs relativas/absolutas.
- *Por quê:* Garante apresentação nativa e navegação correta em modo standalone.

**2. Garantir compatibilidade do payload**
- *Decisão:* Manter o formato atual do `notify-engine` (`title`, `body`, `url`) mas garantir que o SW leia também `event.data.json()` com fallbacks. Opcionalmente padronizar para `data.url`.
- *Por quê:* Evita quebrar fluxos existentes.

**3. Tratamento de ações (opcional)**
- *Decisão:* Adicionar suporte a `actions` quando disponível, mas não obrigatório. Focar em funcionalidade core (exibição + clique).
- *Por quê:* Nem todos os navegadores/OS suportam ações; não é requisito crítico.

## Risks / Trade-offs

- **iOS PWA limitações**: iOS tem restrições para push em alguns casos, mas com PWA instalado e permissões corretas deve funcionar conforme suporte do Safari.
- **Service Worker cache**: Mudanças no SW precisam ser propagadas; com `autoUpdate`/`prompt` já tratado na change anterior.
- **Duplicação de notificações**: Usar `tag` para agrupar.

## Migration Plan

1. Atualizar `public/custom-sw.js`.
2. Verificar `notify-engine` (pode não precisar de mudanças se payload já compatível).
3. Testar em PWA instalado (Android Chrome) e documentar comportamento.
4. Rollback: reverter `custom-sw.js`.
