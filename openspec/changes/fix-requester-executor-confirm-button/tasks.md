## 1. Banco de dados (RPC `confirm_activity`)

- [x] 1.1 Criar migração nova em `supabase/migrations/` que recria `public.confirm_activity(UUID)` com o corpo da versão atual (`20261021000000_remove_pending_approval_from_activity_status.sql`), alterando apenas a guarda de autoconfirmação para excluir o `requester_id`.
- [x] 1.2 Conferir por diff que a migração altera só a guarda: assinatura, `SECURITY DEFINER`, retorno e demais ramos permanecem iguais.

## 2. Frontend (`src/pages/TaskDetail.tsx`)

- [x] 2.1 Trocar a condição de `disabled` do botão de confirmação de `isWorker` para `(isWorker && !isOwner)`, mantendo `actionLoading` e `user_has_confirmed`.

## 3. Testes

- [x] 3.1 Teste de `TaskDetail`: solicitante que também é executor, em `requester_approval` aguardando validação, vê o botão habilitado.
- [x] 3.2 Teste de `TaskDetail`: executor que não é o solicitante vê o botão desabilitado.
- [x] 3.3 Teste da regra da RPC (solicitante-executor aprovado, executor não-solicitante rejeitado, `community_consensus` ainda rejeita executor), seguindo o padrão de `supabase/tests`; se o padrão não cobrir RPCs, documentar a validação manual no `evidence.md` do change.

## 4. Verificação

- [x] 4.1 Rodar `npm run test` e `npm run build` sem regressões nos arquivos alterados.
- [x] 4.2 Rodar `openspec validate fix-requester-executor-confirm-button --strict`.
- [x] 4.3 Migração `20261025000000_fix_requester_executor_confirm.sql` aplicada no Supabase de produção (`rhpcenqbelifilylwujy`) antes do frontend. Aplicada isoladamente, pois o histórico de migrações do projeto está fora de sincronia com o repositório.
- [ ] 4.4 Publicar o frontend e confirmar em produção: solicitante-executor confirma; executor não-solicitante é bloqueado.
- [x] 4.5 Administrador que também é executor pode confirmar em `requester_approval` (conforme a spec), e continua bloqueado em `community_consensus`. Coberto pelos testes de `TaskDetail` e pelo cenário S5/S6 da RPC.
