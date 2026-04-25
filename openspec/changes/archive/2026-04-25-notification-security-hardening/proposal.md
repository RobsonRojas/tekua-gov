## Why

O sistema de notificações atual permite que qualquer usuário autenticado crie notificações para terceiros através de uma RPC pública sem validação, o que representa um risco crítico de segurança (spam e phishing). Além disso, a lógica de negócio está no frontend, o que dificulta a manutenção e a integridade dos dados.

## What Changes

- **Endurecimento de Segurança**: Restrição da RPC `create_notification` para uso exclusivo interno ou por triggers.
- **Automação via Triggers**: Migração da lógica de criação de notificações do frontend para triggers de banco de dados (Server-side).
- **Consistência de Dados**: Garantia de que notificações sejam geradas automaticamente em eventos de comentários e atividades.

## Capabilities

### New Capabilities
- `notification-security-policy`: Define as regras de acesso e criação de notificações no banco de dados.

### Modified Capabilities
- `system-notifications-hub`: Atualização dos requisitos de segurança e fluxo de criação de mensagens.

## Impact

- **Database**: Novas funções PL/pgSQL e Triggers; alteração de permissões na tabela `notifications`.
- **Frontend**: Remoção de chamadas diretas a `create_notification` em `TopicDetail.tsx` e `ActivityCard.tsx`.
- **API**: A RPC `create_notification` deixará de ser acessível publicamente via cliente Supabase.
