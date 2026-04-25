# notification-security-policy Specification

## Purpose
TBD - created by archiving change notification-security-hardening. Update Purpose after archive.
## Requirements
### Requirement: Restrição de Criação Manual de Notificações
O sistema **SHALL** impedir que usuários comuns criem notificações manualmente através da API pública.

#### Scenario: Tentativa de criação manual via RPC
- **WHEN** Um usuário autenticado tenta chamar a função `create_notification` diretamente via cliente Supabase.
- **THEN** O sistema **SHALL** retornar um erro de permissão (403) ou indicar que a função não existe para aquele papel.

### Requirement: Automação de Alertas via Gatilhos de Banco de Dados
O sistema **SHALL** gerar notificações automaticamente a partir de eventos de persistência no banco de dados.

#### Scenario: Notificação de novo comentário
- **WHEN** Um registro é inserido na tabela `topic_comments`.
- **THEN** O banco de dados **SHALL** inserir automaticamente um registro correspondente na tabela `notifications` para o criador do tópico.

#### Scenario: Notificação de tarefa assumida
- **WHEN** Uma `activity` tem seu `worker_id` preenchido.
- **THEN** O banco de dados **SHALL** inserir automaticamente uma notificação para o `requester_id` da atividade.

