## Why

O PWA do portal usa `strategies: 'injectManifest'` com um service worker customizado (`public/custom-sw.js`) que **não** chama `self.skipWaiting()` e **não** trata a mensagem `SKIP_WAITING`. Somado ao `registerType: 'autoUpdate'` em `vite.config.ts`, o `registerSW` do plugin só recarrega a página no evento `activated` — e o novo service worker jamais é ativado enquanto houver uma aba aberta controlando a página. Na prática, quem usa o aplicativo instalado (modo standalone) continua rodando a versão antiga por dias ou semanas, com o bundle antigo em cache, e só recebe a atualização quando fecha **todas** as abas do aplicativo. Falta, portanto, um fluxo que detecte a versão pendente e **obrigue** o refresh do PWA.

## What Changes

- O service worker customizado passa a suportar o ciclo de atualização: listener da mensagem `SKIP_WAITING` chamando `self.skipWaiting()`, `self.clients.claim()` no `activate` e limpeza do cache de versões antigas.
- `vite.config.ts` muda `registerType` de `'autoUpdate'` para `'prompt'`, habilitando o callback `onNeedRefresh` e o envio de `SKIP_WAITING` pela API do `vite-plugin-pwa` (em modo `autoUpdate` o plugin nunca envia a mensagem).
- `src/main.tsx` passa a registrar o service worker com handlers de atualização e a expor a função que aplica a atualização.
- O `PWAContext` (`src/context/PWAContext.tsx`) ganha o estado de atualização pendente (`updateAvailable`), a ação `applyUpdate` e a detecção de um service worker já em estado `waiting` no momento em que o app abre.
- Novo componente **bloqueante** `src/components/pwa/UpdateRequiredDialog.tsx`: quando há versão nova pendente, ele se sobrepõe à aplicação, impede `Esc`/clique fora e **não** oferece opção de dispensar. O usuário só prossegue após o refresh.
- Ao confirmar a atualização: envia `SKIP_WAITING`, aguarda o evento `controllerchange` e recarrega a página; um timeout de segurança força o reload mesmo se o `controllerchange` não vier.
- Antes do reload, a fila de ações offline (`processSyncQueue`) é processada para não perder subscrições/votos/transferências pendentes.
- Novas chaves de i18n em `pwa.*` (pt/en) para o diálogo de atualização obrigatória.
- Testes: `src/pwa.test.ts` ajustado para o novo contrato de registro e novo teste do diálogo/serviço de atualização.

## Capabilities

### New Capabilities

- `pwa-update-refresh`: detecção de versão nova pendente do service worker, aplicação do refresh e o diálogo bloqueante que obriga o usuário a atualizar antes de continuar usando o aplicativo.

### Modified Capabilities

- `pwa-core`: acrescenta o requisito de atualização obrigatória do PWA (a aplicação passa a garantir que o usuário sempre execute a versão mais recente do portal).

## Impact

- **Frontend**: `src/main.tsx`, `src/context/PWAContext.tsx`, `src/components/pwa/UpdateRequiredDialog.tsx` (novo), `src/lib/pwaUpdate.ts` (novo), `src/locales/{pt,en}/translation.json`, `src/pwa.test.ts` (novo `src/components/pwa/UpdateRequiredDialog.test.tsx`).
- **Build / PWA**: `vite.config.ts` (`registerType`), `public/custom-sw.js` (tratamento de `SKIP_WAITING`, `clients.claim()`, limpeza de caches antigos).
- **Testes**: `src/pwa.test.ts` e novo teste unitário do diálogo de atualização.
- **Sem impacto em**: banco de dados (nenhuma migração), Edge Functions, APIs do Supabase e fluxos de negócio.
