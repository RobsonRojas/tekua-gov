## Why

Muitos usuários da Tekua operam em áreas remotas (floresta) com conectividade instável. Atualmente, a plataforma depende de uma conexão ativa para carregar dados e registrar ações, o que impede o uso contínuo em campo. A implementação de suporte offline e cache local é essencial para a inclusão destes usuários.

## What Changes

- **PWA e Service Workers**: Configuração para permitir o carregamento do app sem internet.
- **Cache de Dados Locais**: Armazenamento local das últimas atividades, propostas e perfil do usuário.
- **Fila de Sincronização (Background Sync)**: Registro de ações (como submissão de evidências) que serão enviadas automaticamente quando a conexão for restabelecida.
- **Indicadores de Status de Conexão**: Feedback visual claro sobre o estado da conexão e dados pendentes de envio.

## Capabilities

### New Capabilities
- `offline-data-persistence`: Sistema de armazenamento local (IndexedDB) para dados críticos.
- `background-sync-manager`: Lógica para enfileirar e re-tentar operações de escrita após retorno da conexão.

### Modified Capabilities
- `activity-submission-workflow`: O processo de submissão de evidências agora deve suportar o estado "pendente de sincronização".

## Impact

- **Frontend**: Adição de `idb` ou similar para persistência; configuração do Service Worker; novos hooks de `useOfflineData`.
- **UX**: Mudança no feedback de submissão (de "Sucesso" para "Salvo localmente" quando offline).
- **Architecture**: Transição de um modelo puramente online para um modelo "Offline-First" parcial.
