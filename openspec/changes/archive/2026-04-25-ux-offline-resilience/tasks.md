## 1. Configuração PWA e Infraestrutura

- [x] 1.1 Instalar e configurar `vite-plugin-pwa` no `vite.config.ts`.
- [x] 1.2 Definir o manifesto do app e ícones para instalação mobile.
- [x] 1.3 Adicionar lógica de registro de Service Worker no `main.tsx`.

## 2. Persistência de Dados (IndexedDB)

- [x] 2.1 Instalar biblioteca `idb` e criar utilitário `db.ts` para gerenciar o banco local.
- [x] 2.2 Implementar funções `cacheData(key, data)` e `getCachedData(key)`.
- [x] 2.3 Criar hook `useQueryWithCache` para substituir chamadas diretas ao Supabase em componentes críticos.

## 3. Fila de Sincronização

- [x] 3.1 Implementar tabela local `pending_actions` para armazenar votos e submissões offline.
- [x] 3.2 Criar serviço de sincronização que verifica `navigator.onLine` e processa a fila.
- [x] 3.3 Adicionar componente `OfflineBanner` para alertar o usuário sobre o estado da conexão.

## 4. Validação

- [x] 4.1 Testar o app simulando "Offline" no navegador (DevTools).
- [x] 4.2 Verificar se uma submissão de prova realizada offline é sincronizada corretamente ao religar a internet.
- [x] 4.3 Validar que o cache local é atualizado corretamente após uma sincronização bem-sucedida.
