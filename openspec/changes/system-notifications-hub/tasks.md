## 1. Infraestrutura de Banco de Dados

- [x] 1.1 Criar migração SQL para a tabela `notifications` (id, user_id, title, message, type, link, is_read, created_at).
- [x] 1.2 Configurar políticas de RLS (usuário vê apenas suas próprias notificações).
- [x] 1.3 Implementar função PL/pgSQL `create_notification` para facilitar a geração de alertas via triggers ou outras funções.

## 2. Interface do Centro de Notificações

- [x] 2.1 Adicionar o ícone de sino (Bell) com badge de contagem no `MainLayout.tsx`.
- [x] 2.2 Desenvolver o componente `NotificationList` (Popover ou Drawer).
- [x] 2.3 Implementar a marcação de notificações como lidas (Individual e "Marcar todas").

## 3. Integração em Tempo Real

- [x] 3.1 Configurar o canal do Supabase Realtime para escutar novos registros na tabela `notifications`.
- [x] 3.2 Integrar a criação de notificações em eventos existentes:
    - Comentário em pauta.
    - Confirmação de atividade/payout.
    - Mudança de configuração de governança.

## 4. Testes e Validação

- [x] 4.1 Testar o recebimento em tempo real entre duas abas abertas.
- [x] 4.2 Validar a persistência do status `is_read`.
- [x] 4.3 Garantir que o contador de mensagens não lidas atualize corretamente.
