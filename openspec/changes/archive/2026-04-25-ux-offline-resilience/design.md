## Context

A Tekua é uma SPA (Single Page Application) construída com Vite e React. Atualmente, o `AuthContext` e os hooks de dados fazem requisições diretas ao Supabase via SDK. Se a rede falha, o app exibe erros ou fica em estado de carregamento infinito.

## Goals / Non-Goals

**Goals:**
- Configurar o `vite-plugin-pwa` para suporte básico a offline.
- Implementar uma camada de cache persistente usando IndexedDB (via biblioteca `idb`).
- Criar uma fila de sincronização para ações de "Submissão de Prova" e "Voto".

**Non-Goals:**
- Implementar edição colaborativa offline complexa (apenas submissão individual).
- Sincronizar todos os dados históricos (apenas os últimos 30 registros por categoria).

## Decisions

### 1. Camada de Abstração de Dados
- **Racional**: Para evitar refatorar todos os componentes, criaremos um wrapper sobre o Supabase Client que tenta buscar dados localmente se a rede falhar e atualiza o cache local quando as requisições têm sucesso.

### 2. Uso de `idb` para Cache
- **Racional**: O localStorage tem limites de tamanho muito baixos. O IndexedDB permite armazenar imagens de evidências e grandes listas de atividades com segurança.

### 3. Fila de Sincronização em Background
- **Racional**: Usaremos o `Background Sync API` (onde disponível) ou uma verificação manual de `navigator.onLine` no carregamento do app para processar a fila de ações pendentes.

## Risks / Trade-offs

- **[Risco] Conflitos de Versão de Dados** → **[Mitigação]** Usar timestamps de `updated_at`. O servidor sempre vence em caso de conflito, mas o usuário é notificado.
- **[Risco] Consumo de Armazenamento no Dispositivo** → **[Mitigação]** Implementar política de expiração (LRU Cache) para remover dados antigos após 7 dias.
