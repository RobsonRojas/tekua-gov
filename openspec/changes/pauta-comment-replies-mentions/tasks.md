## 1. Banco de dados

- [x] 1.1 Criar migração `parent_id` (FK self, `ON DELETE CASCADE`, índice) e `mentioned_user_ids UUID[] NOT NULL DEFAULT '{}'` em `topic_comments`
- [x] 1.2 Atualizar `full_database_schema.sql`
- [ ] 1.3 Aplicar migração em produção (`npx supabase db push`, com confirmação)

## 2. Regras e edge function

- [x] 2.1 Em `topicRules.ts`, adicionar regras puras: normalização do pai para o nível raiz, filtro/limite de IDs mencionados, decisão de quem notificar (menção x resposta, sem autor, sem duplicata) + testes Deno
- [x] 2.2 `addComment`: aceitar `parentId` e `mentionedUserIds`; validar pauta aberta, pai da mesma pauta e menções existentes; gravar colunas novas
- [x] 2.3 `addComment`: disparar `notify-engine` de forma assíncrona para menções e resposta
- [x] 2.4 `fetchTopicDetail`: devolver `parent_id` e `mentioned_user_ids` (já cobertos por `select('*')`; confirmar)
- [x] 2.5 `notify-engine`: tratar `governance.topic_mention` e `governance.topic_reply` (e-mail, in-app, push; textos pt/en)

## 3. Frontend

- [x] 3.1 Extrair a lógica de `@` de `TaskInteractions.tsx` para componente/hook compartilhado e manter os testes de tarefas verdes
- [x] 3.2 `TopicDetail.tsx`: usar o campo com menção no novo comentário
- [x] 3.3 `TopicDetail.tsx`: botão "Responder" com campo inline, exibição das respostas sob o comentário pai, nome mencionado destacado
- [x] 3.4 Desabilitar comentar/responder quando a pauta estiver `closed`
- [x] 3.5 Traduções pt/en

## 4. Testes e verificação

- [x] 4.1 Testes Vitest de `TopicDetail`: responder, menção, pauta encerrada
- [x] 4.2 Rodar `npx deno test` das regras e `npx vitest run` dos arquivos tocados (sem piorar a linha de base conhecida)
- [ ] 4.3 Deploy de `api-governance` e `notify-engine`; verificar em produção comentário, resposta e menção
