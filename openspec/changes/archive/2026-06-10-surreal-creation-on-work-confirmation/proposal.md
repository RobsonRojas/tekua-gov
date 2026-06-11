## Why

Atualmente, na confirmação de uma tarefa no Mural de Trabalho (work-wall), a recompensa em Surreais é debitada da carteira do solicitante (requester) e transferida para o executor (worker). Isso limita a criação de demandas, pois exige que os membros tenham saldos suficientes para propor tarefas comunitárias. Para incentivar o engajamento e a circulação da moeda na economia de dádiva da Vila Tekuá, as recompensas das tarefas confirmadas devem ser criadas (emitidas pela Tesouraria) e creditadas diretamente na carteira do executor, sem onerar o solicitante.

## What Changes

- Alterar a função RPC `confirm_activity` para que, ao confirmar uma atividade do tipo tarefa (ou qualquer atividade validada por aprovação do solicitante), o pagamento seja originado da Tesouraria (remetente nulo), criando novas moedas para o executor em vez de debitar do solicitante.
- Garantir que a lógica de auditoria e ledger registre a transação corretamente como uma emissão/recompensa da Tesouraria vinculada à atividade correspondente.

## Capabilities

### Modified Capabilities
- `gift-economy-tasks`: Atualizar o cenário de Pagamento Virtual (Wallet) para que as recompensas de tarefas sejam pagas (criadas) pela Tesouraria para o executor.

## Impact

- Banco de dados Supabase (função RPC `confirm_activity` na migration).
- Histórico de transações e ledger (as transferências de tarefas agora virão da Tesouraria/NULL).
