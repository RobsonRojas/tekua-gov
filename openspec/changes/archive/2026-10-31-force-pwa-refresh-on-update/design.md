## Context

Ver `proposal.md` — Why. Estado técnico atual que condiciona a abordagem:

- `vite.config.ts` usa `VitePWA({ strategies: 'injectManifest', srcDir: 'public', filename: 'custom-sw.js', registerType: 'autoUpdate', injectManifest: { injectionPoint: 'self.__WB_MANIFEST' } })`.
- `public/custom-sw.js` importa o Workbox 6.5.4 via `importScripts`, faz `precacheAndRoute(self.__WB_MANIFEST)`, aplica `CacheFirst` para imagens e fontes e trata `push`/`notificationclick`. **Não** trata a mensagem `SKIP_WAITING`, **não** chama `self.skipWaiting()` e **não** chama `self.clients.claim()`.
- No modo `injectManifest`, as opções `workbox.skipWaiting`/`workbox.clientsClaim` que o plugin configura para `registerType: 'autoUpdate'` **não são aplicadas**: elas só têm efeito na estratégia `generateSW`. O `skipWaiting` efetivo depende inteiramente do `custom-sw.js`.
- `vite-plugin-pwa@1.2.0` (`dist/client/build/register.js`): no modo `autoUpdate` (`__SW_AUTO_UPDATE__ === "true"`) a função `updateServiceWorker()` **nunca** envia a mensagem `SKIP_WAITING` (early-return quando `auto` é verdadeiro) e o reload automático acontece apenas no evento `activated`. Como o `custom-sw.js` não faz `skipWaiting`, o novo worker nunca chega a `activated` enquanto uma aba estiver controlando a página → a atualização fica pendente indefinidamente.
- `src/main.tsx` chama `registerSW({ immediate: true })` sem `onNeedRefresh`, sem `onOfflineReady` e sem guardar a função de atualização retornada.
- `src/context/PWAContext.tsx` + `src/components/pwa/InstallPrompt.tsx` já establish o padrão de UI do PWA (contexto React + componente MUI + `usePWA()` + i18n). `PWAProvider` envolve toda a aplicação em `src/App.tsx`.
- `src/lib/syncService.ts` expõe `processSyncQueue()`, que drena a fila de ações offline (IndexedDB, `src/lib/db.ts`).
- `src/locales/{pt,en}/translation.json` já possuem o namespace `pwa` (`install`, `ready`, `newContent`); `pwa.newContent` ("Novo conteúdo disponível, clique para atualizar.") está **sem uso** no código.
- `src/pwa.test.ts` fixa o contrato `registerSW({ immediate: true })` e precisará ser ajustado.
- `vercel.json` define `Cache-Control: immutable` apenas para `/assets/(.*)`; o `custom-sw.js` (raiz) fica no cache padrão da Vercel.

## Goals / Non-Goals

**Goals:**
- Fazer o service worker realmente alcançar o estado `activated` quando há uma nova versão, com controle imediato da página (`clients.claim`).
- Expor na interface o estado "atualização pendente" e bloquear o uso do portal até que o refresh aconteça.
- Garantir que o refresh Always aconteça: existe caminho de fallback se `controllerchange` não chegar ou se a ativação falhar.
- Não perder ações enfileiradas offline no momento do reload.

**Non-Goals:**
- Não implementar "atualização automática silenciosa" (reload sem_aviso do usuário): exigir a ação do usuário é o que torna a atualização "obrigatória" e evita perda de rascunhos em aberto.
- Não alterar o precacheamento, as estratégias de cache de imagens/fontes ou o comportamento de push notifications do SW.
- Não construir um mecanismo de versionamento da aplicação no banco / via API (a versão é a do bundle, detectada pelo próprio SW).
- Não mexer em Edge Functions, RLS ou fluxos de negócio.

## Decisions

**1. Mudar `registerType` de `'autoUpdate'` para `'prompt'` e usar `onNeedRefresh`.**
- *Decisão:* `vite.config.ts` passa a `registerType: 'prompt'`; `src/main.tsx` registra o SW com `onNeedRefresh` (sinaliza atualização pendente) e guarda a função `updateServiceWorker` retornada por `registerSW`.
- *Alternativas:* (a) manter `autoUpdate` e implementar todo o fluxo à mão com `navigator.serviceWorker` (`updatefound`/`waiting`/`controllerchange`) — duplica o que o plugin já faz e ainda disputa o reload com o listener `activated` do plugin, causando reload duplo; (b) manter `autoUpdate` e adicionar `self.skipWaiting()` no `install` do SW — faria o swap automático sem controle do usuário, janela em que o app troca de bundle sem recarregar a página (estado inconsistente entre a SPA em memória e o HTML novo).
- *Por quê:* `prompt` é o único modo em que o plugin expõe `onNeedRefresh` **e** envia `SKIP_WAITING`; o controle do momento do refresh fica com a aplicação, que é o requisito.

**2. `custom-sw.js` passa a entender `SKIP_WAITING` e a tomar controle dos clients.**
- *Decisão:* adicionar `self.addEventListener('message', ...)` tratando `{ type: 'SKIP_WAITING' }` → `self.skipWaiting()`; adicionar `self.addEventListener('activate', ...)` → `self.clients.claim()` e `workbox.precaching.cleanupOutdatedCaches()`.
- *Por quê:* `wb.messageSkipWaiting()` do plugin envia exatamente `{type:'SKIP_WAITING'}`; sem handler no SW a mensagem é ignorada. E, sem `clients.claim()`, o novo worker ativa mas **não** controla a página atual, o evento `controllerchange` não dispara e o reload nunca acontece — o requisito "a atualização sempre é aplicada" quebraria nesse ponto.
- *Alternativa:* não usar `clients.claim()` e forçar o reload por conta própria — funciona, mas deixa a página sob controle do worker antigo até o reload e posterga a limpeza dos caches antigos; `claim()` + reload é o comportamento esperado de uma atualização.

**3. Estado de atualização no `PWAContext`, com o diálogo renderizado dentro do `PWAProvider`.**
- *Decisão:* `PWAContext` passa a expor `updateAvailable: boolean` e `applyUpdate: () => void` (além do estado de instalação já existente). O `PWAProvider` renderiza `<UpdateRequiredDialog />` junto com seus filhos.
- *Alternativas:* (a) store global dedicado (zustand/redux) — a base já não usa essas libs para estado de UI e o padrão do projeto é Context; (b) renderizar o diálogo em cada página — replicação e risco de esquecer uma rota.
- *Por quê:* `PWAProvider` já envolve a aplicação inteira (`src/App.tsx`), então um único ponto cobre rotas públicas e privadas sem prop drilling.

**4. Diálogo bloqueante, não dispensável.**
- *Decisão:* `UpdateRequiredDialog` (MUI `Dialog` em modo `fullScreen` no mobile) com `disableEscapeKeyDown`, sem `onClose`, sem botão de fechar e sem ação "depois"; a única ação é "Atualizar agora".
- *Por quê:* o requisito é **obrigar** o refresh. Um banner/snackbar dispensável deixaria o usuário seguir na versão antiga.
- *Alternativa:* reload automático e silencioso — não dá controle ao usuário e pode destruir estado em edição (formulário de demanda, rascunho de texto).
- *Nota de a11y:* o MUI `Dialog` já garante foco preso, `aria-modal` e papel de diálogo; o texto explica que a página será recarregada, e o botão fica sempre habilitado (nunca há "cancelar" que deixe o app travado sem saída).

**5. Sequência de aplicação da atualização com fallback garantido.**
- *Decisão:* `applyUpdate()` executa, nesta ordem: (1) `processSyncQueue()` com timeout curto (best-effort, 2s); (2) `registration.waiting.postMessage({ type: 'SKIP_WAITING' })`; (3) espera `controllerchange` → `window.location.reload()`; (4) timeout de 5s → `window.location.reload()` de qualquer forma.
- *Por quê:* o `controllerchange` é o sinal padrão de que o novo worker assumiu a página; o timeout cobre desde SWs que não suportam `claim()` até falhas de ativação. Sem o fallback, o usuário ficaria preso em um diálogo que não pode dispensar.
- *Guarda de laço:* um flag `reloadingRef` garante que o reload seja disparado uma única vez, evitando loop caso o SW continue reportando "waiting" após o reload.

**6. Detecção em dois momentos: durante a sessão e na abertura do app.**
- *Decisão:* (a) `onNeedRefresh` do plugin cobre a atualização que chega com a aplicação aberta; (b) na montagem do `PWAProvider`, `navigator.serviceWorker.getRegistration()` → se `registration.waiting` existir, marcar `updateAvailable = true` (usuário que fechou o app com a atualização já baixada); (c) `registration.addEventListener('updatefound')` → acompanhar `installing.statechange` até `installed` como redundância para navegadores onde o evento do plugin não dispara.
- *Por quê:* sem (b), o caso mais comum — atualização baixada numa sessão anterior — ficaria invisível até a próxima atualização.

**7. Guard de ambiente de desenvolvimento.**
- *Decisão:* em `import.meta.env.DEV`, o fluxo de atualização forçada é desativado (nem diálogo, nem reload).
- *Por quê:* `devOptions.enabled: true` faz o Vite regerar o service worker a cada alteração, o que geraria diálogos de atualização em loop durante o desenvolvimento local.
- *Alternativa:* desativar o SW em dev — quebraria o offline e a instalação testada em dev.

**8. Textos no namespace `pwa` já existente.**
- *Decisão:* reaproveitar `pwa.newContent` (hoje sem uso) e acrescentar `pwa.updateRequiredTitle`, `pwa.updateRequiredDesc`, `pwa.updateNow`, `pwa.updating` em `pt` e `en`.
- *Por quê:* mantém a nomenclatura de i18n do projeto e evita um namespace novo para o mesmo domínio.

**9. `Cache-Control: no-cache` para o script do service worker na Vercel.**
- *Decisão:* em `vercel.json`, adicionar uma regra de header para `/custom-sw.js` (e `/sw.js`/`/workbox-*.js`, caso existam) com `Cache-Control: no-cache`.
- *Por quê:* o navegador decide se há nova versão comparando o script do SW; se a CDN entregar uma cópia antiga do `custom-sw.js`, a atualização nunca é detectada e a mudança de `registerType`/handlers do SW não chega ao dispositivo.

**10. Testes no padrão já existente do repositório.**
- *Decisão:* (a) ajustar `src/pwa.test.ts` para o novo contrato de `registerSW` (com `onNeedRefresh`); (b) novo `src/components/pwa/UpdateRequiredDialog.test.tsx` cobrindo: aparece quando há atualização pendente, não pode ser fechado por `Esc`/clique fora e o botão dispara `applyUpdate`; (c) novo `src/lib/pwaUpdate.test.ts` cobrindo a detecção via `registration.waiting` e a ordem da aplicação (fila offline → `SKIP_WAITING` → reload).
- *Por quê:* o projeto já exige cobertura automatizada (spec `progressive-web-app`) e o comportamento é verificável por unidade sem depender de um navegador real.

## Risks / Trade-offs

- **Perda de estado em edição ao recarregar** → o diálogo avisa explicitamente que a página será recarregada; o usuário decide o momento. Estado que precisa sobreviver já é persistido offline (IndexedDB) e a fila é drenada antes do reload.
- **Loop de atualização em produção se o SW nunca for ativado** → o guard `reloadingRef` + timeout encerram o ciclo; o reload busca o HTML novo, que referencia o bundle novo.
- **Dispositivo offline quando a atualização é detectada** → o `skipWaiting`/reload falha silenciosamente; a aplicação segue funcionando com o shell em cache e a tentativa é refeita no próximo carregamento online.
- **Safari/iOS em modo standalone** → `controllerchange` nem sempre é emitido em versões antigas; o timeout de 5s cobre o caso, com reload apoiado no cache do shell.
- **Ruído no desenvolvimento local** → mitigado pelo guard `import.meta.env.DEV`.
- **SW antigo em produção sem `skipWaiting`** → usuários que não atualizarem continuam na versão antiga até fecharem o app; o primeiro deploy ativa o novo SW, e a partir daí o fluxo se aplica.
- **Rollback passa pelo mesmo diálogo** → ao reverter o deploy, a versão anterior é detectada como "atualização" e aplicada via o mesmo fluxo; o usuário não fica preso.

## Migration Plan

1. Merge do código (frontend + `public/custom-sw.js` + `vercel.json` + `vite.config.ts`).
2. Deploy na Vercel. O novo `custom-sw.js` é publicado; o SW ainda em controle é o antigo e o navegador detecta a diferença no próximo check (navegação/periodic update).
3. Usuadores com app aberto recebem o diálogo de atualização obrigatória e o aplicam; o `SKIP_WAITING` ativa o novo SW, que assume o controle e recarrega a página com o bundle novo.
4. **Rollback:** reverter o deploy. Os demais usuários recebem a versão anterior pelo mesmo fluxo de atualização (o diálogo reaparece). Como não há migração de dados nem mudança de contrato de API, o rollback é seguro e imediato.

## Open Questions

- (Nenhuma que afete specs, abordagem ou quebra de tarefas. Ajustes de copy final do diálogo podem ser refinados durante a implementação sem alterar o comportamento especificado.)
