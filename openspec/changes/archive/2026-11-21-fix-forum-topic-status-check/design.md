## Context

`discussion_topics.status` tem `CHECK (status IN ('open','closed'))` e default `'open'` (migração `20260408000001_create_voting_system.sql`; idêntico em `full_database_schema.sql`). O frontend (`Voting.tsx`, `TopicDetail.tsx`) e os testes usam `open`/`closed`. Apenas a edge function `api-governance` usa `'active'`, em `createTopic` e `castVote`.

## Goals / Non-Goals

**Goals:** corrigir a criação de pautas e a votação alinhando a edge function ao vocabulário do schema.

**Non-Goals:** alterar schema, adicionar novos status, mudar UI.

## Decisions

- **Corrigir o código, não o CHECK.** Alterar o CHECK para aceitar `'active'` exigiria migração e deixaria dois vocabulários (`open`/`active`) para a mesma ideia, além de quebrar o frontend que testa `status === 'open'`. Corrigir a função é menor e coerente com dados e UI existentes.
- **Omitir `status` no insert?** Seria possível confiar no default, mas gravar `'open'` explicitamente deixa a intenção clara e protege contra mudança de default.
- **Extrair constantes** (`TOPIC_STATUS_OPEN = 'open'`) na função para evitar nova divergência de literais.

## Risks / Trade-offs

- `castVote` hoje rejeita todas as pautas (todas são `open`); a correção passa a aceitar votos, comportamento esperado pela spec. → Cobrir com teste.
- Edge function precisa de redeploy; o frontend não muda. → Incluir deploy e verificação manual em tasks.
