# Evidência de verificação automatizada

Requisitos de `pwa-update-refresh` e `pwa-core` cobertos por testes automatizados (Vitest, `npx vitest run`).

## pwa-update-refresh

| Requisito | Cenário | Teste |
| --- | --- | --- |
| Detecção de Versão Pendente | Nova versão detectada com a aplicação aberta | `src/lib/pwaUpdate.test.ts` — `watchForUpdates signals on installed with controller` |
| Detecção de Versão Pendente | Atualização pendente já existente na abertura | `src/lib/pwaUpdate.test.ts` — `detectWaitingUpdate signals when registration.waiting exists` |
| Diálogo Bloqueante | Atualização obrigatória impede o uso / sem forma de dispensar | `src/components/pwa/UpdateRequiredDialog.test.tsx` — `renders when updateAvailable is true and cannot be dismissed`, `stays open on Escape and backdrop click` |
| Diálogo Bloqueante | Único caminho de saída é a atualização | `src/components/pwa/UpdateRequiredDialog.test.tsx` — `calls applyUpdate when clicking update button` |
| Aplicação da Atualização | Atualização aplicada com sucesso (fila → SKIP_WAITING → reload) | `src/lib/pwaUpdate.test.ts` — `applyUpdate processes queue, posts SKIP_WAITING, waits for controllerchange or timeout, then reloads` |
| Aplicação da Atualização | Ativação sem sinalização de controle ainda recarrega | `src/lib/pwaUpdate.test.ts` — `applyUpdate falls back to reload on timeout` |
| Preservação de Ações Pendentes | Ação offline enfileirada antes do reload | `src/lib/pwaUpdate.test.ts` — `applyUpdate processes queue, ...` (asserta `processSyncQueue` chamado) |

Não cobertos por teste automatizado (verificação manual pendente, tarefa 9.3): falha de ativação do SW, navegador sem suporte a service worker, e textos localizados renderizados no idioma ativo.

## pwa-core

| Requisito | Cenário | Teste |
| --- | --- | --- |
| Atualização Obrigatória do Aplicativo Instalado | Usuário em versão obsoleta | `src/lib/pwaUpdate.test.ts` — `detectWaitingUpdate…` e `UpdateRequiredDialog.test.tsx` — `renders when updateAvailable is true…` |
| Atualização Obrigatória do Aplicativo Instalado | Atualização concluída | `src/lib/pwaUpdate.test.ts` — `applyUpdate processes queue, …reloads` |

## Registro do service worker

`src/pwa.test.ts` — `should register service worker with immediate: true and onNeedRefresh`.

## Ambiente de teste

Vitest executa com `import.meta.env.DEV === true`. Os testes de `pwaUpdate` usam `vi.stubEnv('DEV', false)` para exercitar o fluxo de atualização, que é desativado em desenvolvimento.

## Verificação em navegador (tarefa 9.3)

Executada em build de produção (`npm run build`, `vite preview` em `http://localhost:4173`) com Chrome headless e Playwright:

- SW da versão 1 controlando a página; escopo registrado `http://localhost:4173/`; sem diálogo antes da atualização.
- Build 2 gerado com uma alteração real de conteúdo em `src/main.tsx` e `reg.update()` disparado na página.
- Diálogo de atualização obrigatória exibido; `Esc` e clique fora não o fecham; botão "ATUALIZAR AGORA" presente.
- Após o clique: página recarregada, controller presente, e o marcador da versão 2 apareceu no console.

A alteração temporária em `src/main.tsx` foi revertida e o build final foi regenerado a partir do código sem ela.
