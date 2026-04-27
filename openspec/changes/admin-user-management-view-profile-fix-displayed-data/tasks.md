## 1. Correção no Profile.tsx

- [ ] 1.1 Substituir todas as ocorrências de `profile?.` por `currentProfile?.` no arquivo `src/pages/Profile.tsx`.
- [ ] 1.2 Garantir que o `Avatar` exiba a inicial de `currentProfile?.full_name` ou `currentProfile?.email`.
- [ ] 1.3 Garantir que o campo de Email Corporativo exiba `currentProfile?.email` em vez de `authUser?.email`.
- [ ] 1.4 Garantir que o campo "Membro desde" exiba a data de `currentProfile?.created_at`.

## 2. Verificação

- [ ] 2.1 Executar `npm run build` para garantir que não houve erros de tipo.
- [ ] 2.2 Validar visualmente acessando o perfil de um usuário diferente como administrador.
