## Context

O usuário do portal não possui um local para revisar suas próprias interações. Ter um histórico de atividades centralizado é vital para auditoria pessoal, permitindo que o membro verifique quando e o que votou, quais tarefas completou e quando acessou a conta. Isso também ajuda em possíveis disputas ou dúvidas sobre a participação na associação.

## Goals / Non-Goals

**Goals:**
- Implementar a tabela de log de atividades persistente.
- Criar a interface de Timeline (linha do tempo) no perfil.
- Diferenciar os tipos de atividades (Autenticação, Votação, Tarefas, Documentos).
- Garantir a privacidade (membros não veem atividades de outros, apenas as próprias).

**Non-Goals:**
- Auditoria administrativa global (será tratada em um painel administrativo de logs separado, no futuro).
- Exportação de logs em formato CSV/PDF nesta fase.

## Decisions

- **Schema Definition**: Esta é a especificação mestre da tabela `activity_logs`.
    - `id`: UUID (PK)
    - `user_id`: UUID (FK `profiles`)
    - `action_type`: ENUM (`auth`, `vote`, `task`, `document`, `profile_update`)
    - `description`: JSONB (Metadados da ação, suportando i18n: `{ "pt": "...", "en": "..." }`)
    - `ip_address`: TEXT (Opcional, para segurança)
    - `created_at`: TIMESTAMPTZ (Default `now()`)
- **Logging Injection (Edge Functions)**:
    - O registro de logs não deve ser disparado diretamente pelo frontend.
    - Toda **Edge Function** de mutação (voto, tarefa, profile) deve inserir uma linha correspondente na `activity_logs` como parte da transação.
- **Privacy & Security (RLS)**:
    - Membros (`member`) podem ler apenas logs onde `user_id == auth.uid()`.
    - Administradores (`admin`) possuem acesso de leitura global a esta tabela.
- **UI Architecture**: Utilizar componentes de timeline do MUI no perfil do usuário (`/profile/activity`).

## Risks / Trade-offs

- **Performance**: O crescimento rápido da tabela de logs pode tornar a consulta lenta. É fundamental ter bons índices em `user_id` e `created_at`.
- **Incompleteness**: Logs retroativos não são possíveis. A auditoria passará a contar apenas após a implementação desta mudança.
