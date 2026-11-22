## Context

Veja `proposal.md` para a motivação.
Atualmente:
1. `api-governance/index.ts` tenta gravar votos usando:
   ```ts
   .from('topic_votes')
   .upsert({ 
     topic_id: topicId, 
     user_id: user.id, 
     option,
     updated_at: new Date().toISOString()
   })
   ```
   No entanto, a tabela `topic_votes` (definida em `20260408000001_create_voting_system.sql` e `full_database_schema.sql`) foi criada com: `id`, `topic_id`, `user_id`, `option`, `created_at`. O Supabase PostgREST retorna `400: Could not find the 'updated_at' column of 'topic_votes' in the schema cache`.
2. Em `TopicDetail.tsx`, o bloco que renderiza `topic.content` não possui estilos de quebra contínua (`overflowWrap: 'break-word'`, `wordBreak: 'break-word'`, `maxWidth: '100%'`). Quando a pauta contém textos sem quebra ou HTML com tabelas/pre/imagens não contidos, o conteúdo transborda pela lateral direita.
3. No envio de comentários e respostas, falhas são tratadas com `alert(t('voting.commentError'))` estático, sem detalhar o erro vindo da API (`error.message`) e sem usar a notificação padrão via Snackbar / feedback amigável da UI.

## Goals / Non-Goals

**Goals:**
- Criar migração SQL adicionando a coluna `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` na tabela `topic_votes` e atualizar `full_database_schema.sql`.
- Garantir que a edge function `api-governance` consiga upsertar votos normalmente com `updated_at`.
- Corrigir o overflow em `TopicDetail.tsx` aplicando classes/estilos de contenção (`overflowWrap: 'break-word'`, `wordBreak: 'break-word'`, `maxWidth: '100%'`) no container da descrição e no `SanitizedHTML`.
- Exibir mensagens de erro da API de forma clara no `TopicDetail.tsx` (usando Snackbar com auto-dismiss ou alert mais informativo com `error.message`).
- Garantir que a suíte de testes e o build (`npm run build`) passem com 100% de sucesso.

**Non-Goals:**
- Reescrever a lógica de apuração de votos ou regras de governança.
- Alterar as regras de comentários ou recompensas em surreais.

## Decisions

### 1. Adicionar `updated_at` na tabela `topic_votes`
- **Decisão**: Criar a migração `20261122000000_add_updated_at_to_topic_votes.sql` com:
  ```sql
  ALTER TABLE topic_votes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  ```
- **Rationale**: `api-governance` já faz upsert com `updated_at` (o que faz sentido para permitir que votos sejam atualizados ou idempotentes com timestamp de alteração). Adicionar a coluna alinha a modelagem com o comportamento esperado pelo backend e pelas boas práticas do projeto.
- **Alternativa considerada**: Remover `updated_at` de `api-governance`. Rejeitada porque perderia o rastreamento temporal da modificação do voto e obrigaria a não usar o padrão que já foi codificado no edge.

### 2. Contenção de quebra de linha no `TopicDetail.tsx`
- **Decisão**: No Box do conteúdo da pauta e no componente `SanitizedHTML`:
  Adicionar estilo:
  ```tsx
  sx={{
    mt: 2,
    mb: 4,
    maxWidth: '100%',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    '& img': { maxWidth: '100%', height: 'auto' },
    '& pre, & code': { whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
  }}
  ```
- **Rationale**: Impede que strings longas, URLs ou tags formatadas vazem a largura do `Paper` no container MUI.

### 3. Feedback de erro no envio de comentários e votos
- **Decisão**: Em vez de `alert()`, utilizar o `Snackbar` já existente com `setNotice(error?.message || t('voting.commentError'))`, garantindo feedback não intrusivo e que detalha o erro real caso o usuário queira entender o problema.

## Risks / Trade-offs

- **[Cache de Schema do PostgREST]** → A adição da coluna no banco em produção requer reload do schema cache do PostgREST (`NOTIFY pgrst, 'reload schema'`). A migration deve incluir esse reload ou ser executada via Supabase migrations.
