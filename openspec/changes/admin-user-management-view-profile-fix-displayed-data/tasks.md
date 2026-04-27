## 1. Correção no Profile.tsx

- [x] 1.1 Substituir todas as ocorrências de `profile?.` por `currentProfile?.` no arquivo `src/pages/Profile.tsx`.
- [x] 1.2 Garantir que o `Avatar` exiba a inicial de `currentProfile?.full_name` ou `currentProfile?.email`.
- [x] 1.3 Garantir que o campo de Email Corporativo exiba `currentProfile?.email` em vez de `authUser?.email`.
- [x] 1.4 Garantir que o campo "Membro desde" exiba a data de `currentProfile?.created_at`.

## 2. Verificação

- [x] 2.1 Executar `npm run build` para garantir que não houve erros de tipo.
- [x] 2.2 Validar visualmente acessando o perfil de um usuário diferente como administrador.
