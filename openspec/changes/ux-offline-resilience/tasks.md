## 1. Configuração PWA e Infraestrutura

- [ ] 1.1 Instalar e configurar `vite-plugin-pwa` no `vite.config.ts`.
- [ ] 1.2 Definir o manifesto do app e ícones para instalação mobile.
- [ ] 1.3 Adicionar lógica de registro de Service Worker no `main.tsx`.

## 2. Persistência de Dados (IndexedDB)

- [ ] 2.1 Instalar biblioteca `idb` e criar utilitário `db.ts` para gerenciar o banco local.
- [ ] 2.2 Implementar funções `cacheData(key, data)` e `getCachedData(key)`.
- [ ] 2.3 Criar hook `useQueryWithCache` para substituir chamadas diretas ao Supabase em componentes críticos.

## 3. Fila de Sincronização

- [ ] 3.1 Implementar tabela local `pending_actions` para armazenar votos e submissões offline.
- [ ] 3.2 Criar serviço de sincronização que verifica `navigator.onLine` e processa a fila.
- [ ] 3.3 Adicionar componente `OfflineBanner` para alertar o usuário sobre o estado da conexão.

## 4. Validação

- [ ] 4.1 Testar o app simulando "Offline" no navegador (DevTools).
- [ ] 4.2 Verificar se uma submissão de prova realizada offline é sincronizada corretamente ao religar a internet.
- [ ] 4.3 Validar que o cache local é atualizado corretamente após uma sincronização bem-sucedida.
