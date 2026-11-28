## 1. Migration e RLS

- [x] 1.1 Criar migration SQL adicionando política de UPDATE na tabela `topic_votes`
- [x] 1.2 Notificar reload do schema do PostgREST na migration

## 2. Backend da Edge Function (api-governance)

- [x] 2.1 Ajustar a persistência do voto em `castVote` usando `supabaseAdmin` com `onConflict: 'topic_id,user_id'` explícito
- [x] 2.2 Garantir que o tratamento de retorno de `vote` e `reward` permaneça consistente

## 3. Correção de Build e Tipagem TypeScript

- [x] 3.1 Ajustar a declaração do construtor em `supabase/functions/_shared/password-email.ts` para conformidade com `erasableSyntaxOnly`
- [x] 3.2 Executar validação de build (`npm run build`) para assegurar integridade completa

## 4. Testes e Validação

- [x] 4.1 Executar testes unitários relevantes (`npm run test`)
- [x] 4.2 Validar conformidade das especificações com `openspec validate`
