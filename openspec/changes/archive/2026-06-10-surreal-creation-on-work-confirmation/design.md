## Context

Atualmente, a confirmação de tarefas (`validation_method = 'requester_approval'`) aciona a função RPC `confirm_activity`, que realiza a transferência de Surreais do solicitante (`requester_id`) para o executor (`worker_id`). Com a nova regra, todas as recompensas de tarefas confirmadas serão criadas/emitidas (minting) pela Tesouraria, da mesma forma que já ocorre com as contribuições comunitárias.

Além disso, após a introdução do sistema de ledger unificado (`ledger_entries`), a função interna `execute_currency_transfer` precisa ser atualizada para registrar as movimentações no ledger em vez de atualizar a tabela `wallets` diretamente, o que atualmente violaria a trigger `tr_prevent_direct_balance_update`.

## Goals / Non-Goals

**Goals:**
- Alterar o fluxo de pagamento na confirmação de tarefas para que a moeda seja emitida pela Tesouraria (remetente `NULL`).
- Atualizar a função RPC `execute_currency_transfer` para usar o sistema de ledger double-entry (`fn_record_ledger_entry`), garantindo integridade e consistência de saldos.

**Non-Goals:**
- Alterar a lógica de aprovação ou moderação de tarefas ( Conselho Transversal ou aprovação do solicitante permanecem idênticos).
- Alterar outras transferências P2P manuais que não sejam de recompensa de tarefas.

## Decisions

### 1. Origem do Pagamento de Tarefas
- **Decisão:** Passar `NULL` como `p_from_wallet` na chamada de `execute_currency_transfer` no fluxo de `requester_approval` na função `confirm_activity`.
- **Racional:** O valor `NULL` representa a carteira do sistema (Tesouraria). Isso faz com que novas moedas sejam criadas para pagar o executor, sem debitar a carteira do criador da tarefa.

### 2. Refatoração de `execute_currency_transfer` para Ledger Unificado
- **Decisão:** Reescrever a lógica interna de `execute_currency_transfer` para buscar os IDs das carteiras (`wallets.id`) do remetente e do destinatário, inserir a transação legada em `transactions` e registrar o lançamento no ledger através de `fn_record_ledger_entry`.
- **Racional:** Isso evita a exceção gerada pela trigger `tr_prevent_direct_balance_update` (que proíbe atualizações diretas de saldo na tabela `wallets`) e sincroniza automaticamente os saldos de forma segura.

## Risks / Trade-offs

- **[Risco]** Sobrecarga ou inflação da moeda Surreal, já que a criação não é mais limitada pelo saldo dos usuários.
  - *Mitigação:* A criação de tarefas ainda passa pela moderação e aprovação do Conselho Transversal e do solicitante.
- **[Risco]** Inconsistência de saldos se o ledger falhar.
  - *Mitigação:* `fn_record_ledger_entry` roda em transação atômica protegida por triggers de integridade e RLS.
