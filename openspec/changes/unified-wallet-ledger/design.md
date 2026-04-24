## Context

O sistema atual tem tabelas separadas para `wallets`, `transactions` e `activities`. O saldo é calculado somando rewards ou subtraindo transfers, o que não segue as melhores práticas financeiras.

## Goals / Non-Goals

**Goals:**
- Implementar uma tabela `ledger_entries` central.
- Todas as operações financeiras devem ser registradas como um par (ou conjunto) de entradas que somam zero.
- Substituir a lógica de `get_available_balance` por uma consulta ao ledger.

**Non-Goals:**
- Implementar suporte a múltiplas moedas (fiat) nesta fase.
- Alterar as regras de governança ou votação.

## Decisions

### 1. Tabela `ledger_entries`
- **Racional**: Um ledger centralizado simplifica a auditoria.
- **Estrutura**:
    - `id`: UUID
    - `wallet_id`: Referência à carteira afetada.
    - `amount`: Valor (positivo para crédito, negativo para débito).
    - `reference_type`: 'activity', 'transfer', 'fee', 'mint'.
    - `reference_id`: ID do objeto relacionado.
    - `created_at`: Data da entrada.

### 2. Contas de Sistema (Virtual Wallets)
- **Racional**: Para contabilidade de dupla entrada, precisamos de "origens" e "destinos" mesmo para emissão de moeda.
- **Exemplos**: `TREASURY_ACCOUNT`, `PLATFORM_FEES_ACCOUNT`, `REWARDS_POOL`.

### 3. Sincronização de Saldo Materializado
- **Racional**: Consultar o ledger inteiro a cada renderização de página é caro.
- **Lógica**: A tabela `wallets.balance` continuará existindo como um cache, atualizada via trigger sempre que uma nova entrada for inserida em `ledger_entries`.

## Risks / Trade-offs

- **[Risco] Discrepância entre Ledger e Balanço** → **[Mitigação]** Criar um job de reconciliação que recalcula o saldo do ledger e corrige a tabela `wallets` se houver erro.
- **[Risco] Complexidade de Migração** → **[Mitigação]** Criar um script que converte todo o histórico de `activities` e `transactions` existentes em entradas de ledger iniciais.
