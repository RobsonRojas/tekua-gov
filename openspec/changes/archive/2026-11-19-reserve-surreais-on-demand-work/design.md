## Context

Regra central: demanda com beneficiário membro é paga pela carteira dele, não pela Tesouraria. Hoje `api-work.createActivity` insere em `activities` e `submit_activity` (RPC) cria contribuição, sem tocar em carteira. O pagamento ocorre em `confirm_activity`, que chama `execute_currency_transfer(NULL, executor, reward)`: cunha da Tesouraria (`wallets.profile_id IS NULL`). Saldos são mantidos por trigger a partir de `ledger_entries` (`fn_record_ledger_entry`), com `CHECK (profile_id IS NULL OR balance >= 0)`. Em `CreateDemand` o `beneficiaryId` é enviado mas ignorado pela API; o criador vira `requester_id`. Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Garantia atômica e à prova de concorrência de que o beneficiário cobre a recompensa.
- Reserva visível e auditável, sem mover o saldo total.
- Pagamento dos executores lastreado na carteira do beneficiário membro.

**Non-Goals:**
- Reserva retroativa de atividades já abertas.
- Reserva para beneficiário "aldeia" (segue Tesouraria).
- Reembolso/estorno após pagamento.
- Alterar a origem do pagamento quando o beneficiário é a aldeia (continua a Tesouraria).

## Decisions

1. **Beneficiário = pagador = `requester_id`, com trava de autoria.** Somente administrador ou membro do conselho (`transversal_council`) pode indicar OUTRO membro como beneficiário; os demais só podem indicar a si mesmos ou a Vila. A regra é aplicada no servidor (`api-work` e `submit_activity`/`fn_assert_can_name_beneficiary`) e refletida na UI. Em demanda, passa a ser o `beneficiaryId` informado (se omitido, é a Vila: sem reserva); em trabalho registrado, o `p_requester_id`. Alternativa descartada: manter criador como pagador, que ignora o campo já exposto na UI.
2. **Reserva como coluna + tabela.** `wallets.reserved_balance NUMERIC(15,2) DEFAULT 0 CHECK (reserved_balance >= 0)` e `surreal_reservations(id, activity_id UNIQUE, wallet_id, amount, status held|consumed|released, timestamps)`. Disponível = `balance - reserved_balance`. A coluna dá leitura barata e `CHECK (balance >= reserved_balance)` protege a invariante; a tabela dá rastreio. Alternativa descartada: derivar tudo de `ledger_entries` (consulta pesada, sem trava simples).
3. **Atomicidade nas RPCs.** Nova RPC `reserve_surreais(activity_id, wallet_profile_id, amount)` com `SELECT … FOR UPDATE` na carteira, chamada dentro de `submit_activity` e de nova RPC `create_activity_with_reservation` (a `createActivity` hoje insere pela tabela; precisa ser transacional com a reserva). A atividade e a reserva nascem na mesma transação; erro desfaz ambas.
4. **Pagamento.** Beneficiário membro: `confirm_activity` transfere, na mesma transação, da carteira do beneficiário para cada executor (lançamentos de ledger beneficiário→executor via `execute_currency_transfer`, usando a reserva `held`), reduz `reserved_balance` e marca a reserva `consumed`. A Tesouraria não participa. Cada executor recebe o valor integral (modelo atual), portanto a reserva é `valor × nº de executores`: no cadastro já se reserva valor × nº de executores informados (mínimo 1); ao entrar um executor adicional reserva-se mais um valor (falha se sem saldo) e, ao sair um executor ou mudar o valor antes do pagamento, a reserva é reajustada (`sync_activity_reservation`). Beneficiário aldeia (sem reserva) continua pago por `execute_currency_transfer(NULL, executor, reward)` da Tesouraria. Atividades legadas sem reserva `held` também seguem pela Tesouraria.
5. **Liberação.** `deleteActivity` (rejeição) e qualquer transição para `rejected` chamam `release_reservation(activity_id)` via trigger em `activities` para não depender de cada caminho.
6. **Disponível em todo débito.** `perform_transfer`, `execute_currency_transfer` (origem não-Tesouraria) e burn em `admin_adjust_wallet_balance` passam a checar `balance - reserved_balance`. A trava `tr_prevent_direct_balance_update` precisa permitir a escrita de `reserved_balance` pelas RPCs.
7. **API/UI.** `getBalance` retorna `reserved_balance` e `available_balance`; formulários consultam o disponível do beneficiário (RPC leve `get_member_available_balance(profile_id)`, retornando só o número, para não expor carteira alheia por RLS).

## Risks / Trade-offs

- [Beneficiário membro passa a pagar os executores, o que antes era cunhagem] → Documentar no manual; aldeia continua pela Tesouraria.
- [Atividades abertas existentes não têm reserva] → `confirm_activity` só paga pela carteira do beneficiário se houver reserva `held`; caso contrário paga pela Tesouraria (legado).
- [Beneficiário com baixo saldo bloqueado de pedir ajuda] → Aceito pelo requisito; beneficiário "aldeia" continua disponível.
- [Reserva presa em atividade parada] → Liberada ao rejeitar/remover; avaliar expiração em mudança futura.
- [Corrida entre transferência e cadastro] → Mitigada por `FOR UPDATE` na carteira em ambos os caminhos.
