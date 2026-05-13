## 1. Diagnosis & Debugging

- [ ] 1.1 Reproduzir o problema no navegador e inspecionar logs de console/rede
- [ ] 1.2 Verificar se a Edge Function `api-members` está recebendo o `targetUserId` e qual erro está retornando
- [ ] 1.3 Validar se existem tabelas no banco de dados bloqueando a deleção por falta de `CASCADE`

## 2. Frontend Implementation

- [ ] 2.1 Corrigir a lógica de `handleMenuOpen` e `handleMenuClose` em `AdminPanel.tsx` para não limpar o `selectedUser` enquanto o diálogo estiver aberto
- [ ] 2.2 Ajustar `handleRemoveMember` para manter o diálogo aberto durante o processamento (`actionLoading`)
- [ ] 2.3 Garantir que o nome/email do usuário apareça corretamente no `DialogContentText`

## 3. Backend & Database Hardening

- [ ] 3.1 Se identificado bloqueio de constraint, criar migration para adicionar `ON DELETE CASCADE` nas tabelas faltantes
- [ ] 3.2 Refinar tratamento de erro em `api-members` para retornar mensagens mais descritivas ao frontend

## 4. Verification

- [ ] 4.1 Criar um usuário de teste e removê-lo via Painel Admin
- [ ] 4.2 Validar que o usuário foi removido tanto da tabela `profiles` quanto do Supabase Auth
- [ ] 4.3 Confirmar que um administrador não consegue remover o próprio acesso
