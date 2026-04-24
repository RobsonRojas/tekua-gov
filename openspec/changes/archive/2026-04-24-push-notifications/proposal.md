## Why

O engajamento dos membros é vital para o sucesso das deliberações na Associação Tekuá. Atualmente, os membros precisam acessar proativamente o portal para verificar novas pautas ou tarefas. A implementação de notificações push no PWA permite que a associação alcance os membros instantaneamente no smartphone ou desktop, informando sobre:
- Novas votações abertas.
- Encerramento de prazos de deliberação.
- Atribuição ou conclusão de tarefas na Economia de Dádiva.
- Alertas de segurança ou avisos gerais administrativos.

Isso aumenta significativamente a taxa de participação e a agilidade nos processos de governança.

## What Changes

Implementar o sistema de Notificações Push:
1.  **Client-side integration**: Utilizar a API nativa de `PushManager` do Service Worker (via `vite-plugin-pwa`) para gerenciar as inscrições e permissões de notificação.
2.  **Consent Flow**: Interface para o usuário aceitar ou recusar notificações (preferencialmente após o login).
3.  **Subscription Storage**: Criar a tabela `push_subscriptions` no Supabase para armazenar os endpoints e chaves de autenticação de cada membro.
4.  **Backend Trigger**: Implementar um fluxo de disparo (Edge Functions ou integração externa) para enviar as notificações através da Web Push API.
5.  **Security**: Configurar chaves VAPID (Voluntary Application Server Identification) para autenticar as mensagens entre o Tekuá e o servidor de push do navegador.

## Capabilities

### New Capabilities
- `push-notifications`: Sistema de alertas em tempo real via navegador/dispositivo móvel para eventos de governança e atividades da comunidade.

### Modified Capabilities
- `progressive-web-app`: Atualizado para suportar eventos de push e visualização de notificações em background.

## Impact

- `src/lib/notifications.ts`: Lógica de inscrição e permissão.
- `src/main.tsx`: Registro do service worker habilitado para notificações.
- `supabase/migrations`: Nova tabela para tokens de push.
- `Public Assets`: Geração e armazenamento seguro do VAPID Public Key.
- `translation.json`: Mensagens de solicitação de permissão e exemplos de alerta.
