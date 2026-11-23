## Context

`topic_comments` (id, topic_id, user_id, content JSONB localizado, created_at) já existe, com `addComment` e `fetchTopicDetail` em `api-governance`. Menções já existem em tarefas: `TaskInteractions.tsx` detecta `@`, busca membros via `api-members:fetchUsers`, guarda `mentionedUserIds`; `api-work` envia `activity.interaction_mention` ao `notify-engine`.

## Decisions

- **Esquema:** `parent_id UUID REFERENCES topic_comments(id) ON DELETE CASCADE` e `mentioned_user_ids UUID[] NOT NULL DEFAULT '{}'`. Sem tabela de junção: menções só são lidas junto ao comentário.
- **Um nível de resposta:** o servidor normaliza `parent_id` para o comentário raiz (se o pai já tem pai, usa o pai do pai). Evita árvores profundas na UI mobile. `fetchTopicDetail` continua devolvendo lista plana; o cliente agrupa por `parent_id`.
- **Validação no servidor (`addComment`):** pai deve pertencer ao mesmo `topic_id`; pauta deve estar `open` (`acceptsVotes`-like, reutilizando `topicRules`); IDs mencionados são filtrados contra `profiles`, removendo o autor e duplicatas, com limite (ex.: 20).
- **Texto das menções:** o texto guarda `@Nome` literal; o destaque no cliente casa os nomes dos IDs em `mentioned_user_ids` (resolvidos via perfis já carregados), em vez de marcação especial no conteúdo, para manter o JSONB localizado simples.
- **Reuso:** extrair a lógica de `@` de `TaskInteractions` para um hook/componente (`useMentionInput` / `MentionTextField`) usado em tarefas e pautas, em vez de duplicar. Reuso preservado por teste existente de `TaskInteractions`.
- **Notificações:** dois eventos novos no `notify-engine`, `governance.topic_mention` e `governance.topic_reply`, seguindo o modelo de `activity.interaction_mention`, com link `/voting/<topicId>` (conferir rota real). Disparo assíncrono sem bloquear a resposta, como já feito em `createTopic`. Deduplicação: quem é mencionado e é autor do pai recebe só a notificação de menção.
- **Migração em produção:** `ADD COLUMN` com default, sem lock longo; RLS existente (`user_id = auth.uid()`) continua válida, `parent_id` e menções passam pelo `addComment` com service client.

## Risks / Trade-offs

- Comentários antigos têm `parent_id` nulo: continuam sendo raízes, sem migração de dados.
- Spam de notificações por menções em massa: mitigado pelo limite de menções por comentário.
- Refatorar `TaskInteractions` pode causar regressão: rodar seus testes antes e depois.
