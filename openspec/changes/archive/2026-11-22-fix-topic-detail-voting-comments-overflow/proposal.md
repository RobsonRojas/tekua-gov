## Why

Ao interagir com uma pauta de votação (`TopicDetail`):
1. **Erro ao votar**: Ao clicar nos botões de votação ("Sim", "Não", "Abstenção"), a edge function `api-governance` (`castVote`) tenta salvar o voto com `updated_at: new Date().toISOString()`, mas a tabela `topic_votes` não possui coluna `updated_at`. Isso resulta em HTTP 400 (`{"error":"Could not find the 'updated_at' column of 'topic_votes' in the schema cache"}`). Além disso, votos devem poder ter timestamp de atualização ou `api-governance` deve adicionar a coluna na migration / não enviar campos inexistentes. O ideal e mais seguro é adicionar a coluna `updated_at` à tabela `topic_votes` (via migração compatível com o schema) ou sincronizar a tabela e o backend, garantindo que o voto seja registrado com sucesso.
2. **Erro ao enviar comentário**: Ao submeter um comentário ou resposta na pauta, caso ocorra algum erro na API ou estado, o tratamento atual usa apenas `alert()` genérico sem feedback de loading/erro detalhado, ou falha caso a migration mais recente (`20261103000000_topic_comment_replies_mentions.sql`) não esteja alinhada ou caso campos esperados não estejam presentes. Além disso, precisamos exibir mensagens claras de erro no UI (substituindo ou melhorando o `alert()` com feedback acessível no Snackbar/alerta da interface).
3. **Vazamento do texto da pauta (overflow)**: O container da descrição da pauta (`topic.content`) não possui regras de quebra de linha forçada (`overflow-wrap: break-word`, `word-break: break-word`, `max-width: 100%`), permitindo que textos longos sem espaços, URLs ou conteúdos ricos vazem horizontalmente para o lado direito da tela, rompendo o layout responsivo do card e do container.

## What Changes

- **Banco de dados / Supabase Edge Functions**:
  - Adicionar coluna `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` à tabela `topic_votes` via migração SQL e atualizar `full_database_schema.sql`.
  - Na edge function `api-governance` (`castVote`), garantir resiliência ao registrar o voto.
- **Frontend (`TopicDetail.tsx`)**:
  - Corrigir o vazamento visual da descrição da pauta aplicando quebra de palavra e contenção de overflow (`overflowWrap: 'break-word'`, `wordBreak: 'break-word'`, `maxWidth: '100%'`, `overflow: 'hidden'`) tanto no bloco de texto simples quanto no container de `SanitizedHTML`.
  - Melhorar o tratamento de erro e feedback visual ao enviar comentários ou votar, exibindo a mensagem de erro detalhada retornada da API (via Snackbar ou alerta inline) em vez de falhas silenciosas ou apenas `alert()` sem detalhes do erro.
- **Testes e Validação de Build**:
  - Atualizar testes unitários e de integração (`TopicDetail.test.tsx`, `topicRules.test.ts`) cobrindo votação, envio de comentário e renderização com quebra de linha.
  - Executar a suíte de testes e o build do projeto (`npm run build`).

## Capabilities

### Modified Capabilities
- `voting-system`: Ajustar os requisitos de registro de voto (votação funcional sem falhas de schema em `topic_votes`), envio de comentários com feedback visual de erro amigável, e contenção de layout na área de exibição da descrição da pauta contra quebra horizontal de linha.

## Impact

- `supabase/functions/api-governance/index.ts`: Ação `castVote` e tratamento de erros.
- `supabase/migrations/`: Nova migração adicionando `updated_at` em `topic_votes` (caso necessário para compatibilidade com a edge function) ou alinhando o schema.
- `full_database_schema.sql`: Definição de `topic_votes` atualizada com `updated_at`.
- `src/pages/TopicDetail.tsx`: Estilização do container de conteúdo da pauta contra overflow horizontal; tratamento de erro e feedback aprimorados no envio de comentários e votos.
- Testes Vitest do frontend e regras do Deno.
