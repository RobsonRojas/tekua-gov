## Why

Administradores não conseguem salvar pautas no fórum: toda chamada `api-governance:createTopic` retorna 400 com `new row for relation "discussion_topics" violates check constraint "discussion_topics_status_check"`. A edge function insere `status: 'active'`, mas a tabela só aceita `'open'` ou `'closed'` (`CHECK (status IN ('open','closed'))`), que é também o vocabulário usado pelo frontend (`Voting.tsx`, `TopicDetail.tsx`).

O mesmo desalinhamento existe em `castVote`, que exige `status === 'active'`: mesmo que a pauta fosse criada, nenhum voto seria aceito, pois pautas válidas têm `'open'`.

## What Changes

- `createTopic` passa a gravar `status: 'open'` (valor padrão da coluna e aceito pelo CHECK).
- `castVote` passa a aceitar votos apenas quando `status === 'open'` e rejeita pautas `'closed'`.
- Redeploy da edge function `api-governance`.
- Testes cobrindo criação de pauta com status válido e votação em pauta aberta/encerrada.
- Sem mudança de schema nem migração (o CHECK e o frontend já usam `open`/`closed`).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `voting-system`: o estado inicial de uma pauta criada passa a ser explicitamente "Aberta" (`open`), e votos só são aceitos em pautas abertas.

## Impact

- `supabase/functions/api-governance/index.ts` (`createTopic`, `castVote`)
- Testes da edge function / `tests/voting-system.spec.ts`
- Deploy da função `api-governance` no projeto Supabase
- Possíveis linhas já existentes com `status` inválido: impossível, o CHECK as impediria.
