## 1. Service worker (`public/custom-sw.js`)

- [x] 1.1 Adicionar listener de `message` que trate `{ type: 'SKIP_WAITING' }` chamando `self.skipWaiting()`.
- [x] 1.2 Adicionar listener de `activate` com `self.clients.claim()` e `workbox.precaching.cleanupOutdatedCaches()`, preservando os handlers existentes de `push` e `notificationclick`.
- [x] 1.3 Confirmar que `self.__WB_MANIFEST` continua o ponto de injeção do manifesto e que `precacheAndRoute` continua sendo chamado antes das rotas customizadas.

## 2. Build e hosting

- [x] 2.1 Em `vite.config.ts`, mudar `registerType: 'autoUpdate'` para `registerType: 'prompt'`.
- [x] 2.2 Em `vercel.json`, adicionar header `Cache-Control: no-cache` para `/custom-sw.js` (e `/sw.js`, caso exista), garantindo que o navegador detecte bytes diferentes do script.
- [x] 2.3 Rodar `npm run build` e conferir que `dist/custom-sw.js` é gerado com o manifesto injetado e que o escopo do registro permanece `/`.

## 3. Módulo de atualização (`src/lib/pwaUpdate.ts`)

- [x] 3.1 Criar `src/lib/pwaUpdate.ts` com um store simples (subscribe/getSnapshot) expondo o estado `updateAvailable` e a ação `markUpdateAvailable()`.
- [x] 3.2 Implementar `detectWaitingUpdate()`: chamar `navigator.serviceWorker.getRegistration()` e sinalizar a atualização quando `registration.waiting` existir.
- [x] 3.3 Implementar `watchForUpdates()`: ouvir `updatefound` na registration e o `statechange` do worker `installing`, sinalizando quando o estado for `installed` com `controller` já existente.
- [x] 3.4 Implementar `requestSkipWaiting(registration)` enviando `postMessage({ type: 'SKIP_WAITING' })` ao worker em espera.
- [x] 3.5 Implementar `waitForControllerChange(timeoutMs)`, resolvendo no evento `controllerchange` ou no timeout (5s).
- [x] 3.6 Implementar `applyUpdate()` com a ordem: `processSyncQueue()` (best-effort, timeout curto) → `requestSkipWaiting` → `waitForControllerChange` → `window.location.reload()`, com guard de reload único.
- [x] 3.7 Aplicar guard `import.meta.env.DEV` para que a detecção e o fluxo de atualização não sejam ativados em desenvolvimento.

## 4. Registro do service worker (`src/main.tsx`)

- [x] 4.1 Trocar `registerSW({ immediate: true })` por um registro com `onNeedRefresh` que chame `markUpdateAvailable()` do módulo de atualização, mantendo `immediate: true`.
- [x] 4.2 Guardar a função de atualização retornada por `registerSW` para uso pelo `applyUpdate()` do módulo.

## 5. `PWAContext` (`src/context/PWAContext.tsx`)

- [x] 5.1 Expor `updateAvailable: boolean` e `applyUpdate: () => void` no valor do contexto, consumindo o store de `src/lib/pwaUpdate.ts` via `useSyncExternalStore`.
- [x] 5.2 Na montagem do provider, chamar `detectWaitingUpdate()` e `watchForUpdates()` e iniciar a escuta do evento `controllerchange`.
- [x] 5.3 Renderizar `<UpdateRequiredDialog />` dentro do `PWAProvider` (ao lado dos filhos), garantindo cobertura de todas as rotas.

## 6. Diálogo bloqueante (`src/components/pwa/UpdateRequiredDialog.tsx`)

- [x] 6.1 Criar o componente com MUI `Dialog` em `fullScreen` no mobile, com `disableEscapeKeyDown`, sem `onClose` e sem botão de fechar (não dispensável).
- [x] 6.2 Exibir título, descrição e ação "Atualizar agora" usando as chaves i18n do namespace `pwa`.
- [x] 6.3 Após o clique, desabilitar a ação e exibir o estado "Atualizando…" com indicador de progresso até o reload.
- [x] 6.4 Garantir que o conteúdo atrás do diálogo não receba interação (foco preso e overlay do MUI).

## 7. Internacionalização

- [x] 7.1 Adicionar em `src/locales/pt/translation.json` as chaves `pwa.updateRequiredTitle`, `pwa.updateRequiredDesc`, `pwa.updateNow` e `pwa.updating`.
- [x] 7.2 Adicionar as mesmas chaves em `src/locales/en/translation.json`.
- [x] 7.3 Resolver a chave `pwa.newContent` (hoje sem uso no código): removê-la ou reaproveitá-la como alias do novo texto, sem deixar traduções órfãs.

## 8. Testes

- [x] 8.1 Atualizar `src/pwa.test.ts` para o novo contrato de registro (`immediate: true` + `onNeedRefresh`).
- [x] 8.2 Criar `src/lib/pwaUpdate.test.ts` cobrindo: detecção via `registration.waiting`, sinalização via `updatefound`/`statechange`, ordem de `applyUpdate` (fila offline → `SKIP_WAITING` → reload) e o fallback de timeout.
- [x] 8.3 Criar `src/components/pwa/UpdateRequiredDialog.test.tsx` cobrindo: exibição quando há atualização pendente, impossibilidade de dispensar (Esc/clique fora) e disparo de `applyUpdate` pelo botão.
- [x] 8.4 Rodar `npm run test` e corrigir regressões (incluindo mocks existentes de `registerSW`).

## 9. Verificação

- [ ] 9.1 Rodar `npm run build` e `npm run lint` sem erros.
- [x] 9.2 Rodar `openspec validate force-pwa-refresh-on-update --strict` e confirmar 0 issues.
- [x] 9.3 Conferir manualmente em build local com SW servido: alterar um asset, recarregar e validar que o diálogo de atualização obrigatória aparece e que o reload aplica a nova versão.
- [x] 9.4 Documentar no `openspec/changes/force-pwa-refresh-on-update/` a evidência de cada requisito de `pwa-update-refresh` e `pwa-core` verificado por teste automatizado.
