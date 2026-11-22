## 1. Correção na edge function

- [x] 1.1 Em `supabase/functions/api-governance/index.ts`, trocar `status: 'active'` por `status: 'open'` em `createTopic`
- [x] 1.2 Em `castVote`, trocar a checagem `topic.status !== 'active'` por `topic.status !== 'open'`
- [x] 1.3 Verificar com grep que não restam usos de `'active'` para `discussion_topics` (a linha de `protocols`, que usa `'active'` legitimamente, deve permanecer)

## 2. Testes

- [x] 2.1 Adicionar teste (Vitest/Playwright, conforme padrão existente) garantindo que `createTopic` grava `status: 'open'`
- [x] 2.2 Adicionar teste para `castVote`: aceita pauta `open`, rejeita `closed`
- [x] 2.3 Rodar `npm run test` (e lint/typecheck) e confirmar sucesso (lint e falhas preexistentes movidos para a change fix-lint-and-test-failures)

## 3. Deploy e verificação

- [x] 3.1 Fazer deploy da função `api-governance`
- [x] 3.2 Em produção, criar uma pauta como admin e confirmar que salva, aparece como "Aberta" e aceita voto
