## Why

O cálculo de saldo atual baseado na soma de recompensas de atividades é frágil e difícil de auditar à medida que novos tipos de transações (transferências, taxas, minting) são adicionados. É necessário um sistema de "Livro Razão" (Ledger) baseado em contabilidade de dupla entrada para garantir a integridade financeira absoluta da plataforma.

## What Changes

- **Transição para Modelo de Ledger**: Substituição da soma direta por uma tabela de entradas de ledger (`ledger_entries`).
- **Sistema de Débito e Crédito**: Todas as movimentações financeiras devem ter uma contraparte (ex: Crédito para o Usuário, Débito do Tesouro).
- **Saldo Materializado**: Armazenamento do saldo atualizado na tabela `wallets` para performance, reconciliado periodicamente com o ledger.
- **Auditoria Financeira Nativa**: Cada entrada no ledger é imutável e vinculada a uma transação ou atividade.

## Capabilities

### New Capabilities
- `ledger-accounting-system`: Motor de contabilidade que gerencia entradas de débito e crédito.
- `financial-reconciliation-service`: Ferramenta para validar se o saldo materializado corresponde à soma das entradas do ledger.

### Modified Capabilities
- `wallet-management`: A gestão de carteiras passa a ser baseada em eventos de ledger em vez de atualizações diretas de coluna.

## Impact

- **Database**: Nova tabela `ledger_entries`; migração do histórico de transações e atividades para o formato de ledger.
- **Backend**: Atualização de todos os RPCs de transferência e triggers de payout para usar o novo motor de ledger.
- **Security**: Maior facilidade para identificar discrepâncias ou fraudes financeiras.
