## Context

O sistema de notificações atual (System Notifications Hub) utiliza uma função RPC `create_notification` pública que permite a criação de notificações de forma insegura pelo frontend.

## Goals / Non-Goals

**Goals:**
- Proteger a tabela de notificações contra spam e phishing.
- Automatizar a criação de notificações para eventos principais.
- Remover lógica de negócio de notificações do frontend.

**Non-Goals:**
- Implementar novas funcionalidades de interface (UI) nesta fase.
- Alterar o sistema de Push Notifications externo.

## Decisions

- **Restrição de Acesso**: A RPC `create_notification` será movida para o schema `internal` ou configurada com `REVOKE EXECUTE FROM public` para impedir chamadas diretas via API.
- **Triggers SQL**:
    - `fn_notify_on_comment`: Dispara ao inserir em `topic_comments`. Busca o `created_by` do tópico para notificar.
    - `fn_notify_on_activity_claim`: Dispara quando `activity.worker_id` é preenchido. Notifica o `requester_id`.
    - `fn_notify_on_activity_validation`: Dispara quando `activity.status` muda para 'completed' ou 'validated'. Notifica o `worker_id`.
- **Frontend Cleanup**: Remover as chamadas `supabase.rpc('create_notification', ...)` e deixar que o banco de dados cuide da inserção.

## Risks / Trade-offs

- **Dependência de Triggers**: Lógica de notificações fica escondida no banco de dados, dificultando o debug visual no frontend caso um trigger falhe.
- **Latência**: Inserções nas tabelas originais podem demorar alguns milissegundos extras devido ao processamento dos triggers.
