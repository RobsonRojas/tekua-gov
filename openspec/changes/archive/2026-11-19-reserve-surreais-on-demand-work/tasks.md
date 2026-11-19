## 1. Banco de dados

- [x] 1.1 Migração: `wallets.reserved_balance` + `CHECK (profile_id IS NULL OR balance >= reserved_balance)`; tabela `surreal_reservations` com RLS (dono lê, escrita só via RPC)
- [x] 1.2 RPCs `reserve_surreais`, `release_reservation` e `get_member_available_balance` (SECURITY DEFINER, `FOR UPDATE`, erros de saldo insuficiente)
- [x] 1.3 Ajustar `submit_activity` para reservar do `p_requester_id` membro (sem reserva se NULL)
- [x] 1.4 Criar RPC transacional de criação de demanda com reserva (beneficiário = `beneficiaryId` informado; omitido ou aldeia = sem reserva)
- [x] 1.5 Ajustar `confirm_activity` para pagar cada executor por transferência direta da carteira do beneficiário (consumindo a reserva `held`); sem reserva `held` (aldeia/legado) paga pela Tesouraria
- [x] 1.6 Reserva adicional ao incluir executor em demanda aberta e liberação da parcela ao remover executor antes do pagamento
- [x] 1.7 Trigger em `activities` liberando reserva ao ir para `rejected`
- [x] 1.8 `perform_transfer` e `admin_adjust_wallet_balance` (burn) respeitando saldo disponível; liberar escrita de `reserved_balance` na trava de saldo
- [x] 1.9 Testes SQL em `supabase/tests` cobrindo saldo suficiente/insuficiente, concorrência, pagamento, liberação e legado

## 2. Edge Functions

- [x] 2.1 `api-work.createActivity`: honrar `beneficiaryId`, usar a nova RPC e propagar erro de saldo insuficiente
- [x] 2.2 `api-work.submitActivity`: propagar erro de saldo insuficiente com saldo disponível
- [x] 2.3 `api-wallet.getBalance`: retornar `reserved_balance` e `available_balance`; nova ação para disponível do beneficiário

## 3. Frontend

- [x] 3.1 `CreateDemand.tsx`: exibir saldo disponível do beneficiário, bloquear envio e mostrar erro traduzido
- [x] 3.2 `RegisterWork.tsx`: idem para beneficiário membro
- [x] 3.3 `Wallet.tsx`: mostrar total, reservado e disponível
- [x] 3.4 Textos pt/en em `src/locales` e aviso de reserva nos formulários
- [x] 3.5 Testes de página (`CreateTask`/`RegisterWork`/`Wallet`) para saldo insuficiente e exibição da reserva

## 4. Finalização

- [x] 4.1 `openspec validate reserve-surreais-on-demand-work --strict`
- [x] 4.2 Atualizar `FUNCIONALIDADES_DO_SISTEMA.md` com a regra de reserva
