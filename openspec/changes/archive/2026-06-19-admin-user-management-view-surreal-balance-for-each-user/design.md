## Context

O painel administrativo (`AdminPanel.tsx`) possui uma aba de **Gerenciamento de Usuários** que lista todos os membros com nome, email, cargo e status. Essa lista é alimentada pela ação `fetchUsers` da Edge Function `api-members`, que faz um `SELECT *` em `profiles` usando o cliente admin para bypassar RLS.

A tabela `wallets` já existe no banco e armazena o saldo de Surreais de cada membro via `profile_id`. A leitura de saldos de outros usuários não é exposta por nenhuma API existente — apenas a carteira própria do usuário logado é acessível pela rota `/wallet`. O tesouro é a wallet com `profile_id IS NULL`.

As métricas de tarefas concluídas estão disponíveis na tabela `activities` (campo `status = 'completed'`, campo `worker_id`).

## Goals / Non-Goals

**Goals:**
- Exibir o saldo de Surreais de cada membro na tabela de usuários do AdminPanel (nova coluna)
- Criar nova aba **"Economia"** no AdminPanel com dashboard de métricas financeiras:
  - Total de Surreais em circulação (soma dos saldos de todos os membros)
  - Saldo do Tesouro
  - Ranking de top contribuidores (tarefas concluídas por usuário)
  - Distribuição de saldos (top N holders por saldo)
  - Total de transações realizadas
- A nova ação `fetchUsersWithBalances` na Edge Function `api-members` retorna perfis + saldo em um único round-trip
- Nova ação `fetchEconomyStats` em `api-members` (ou `api-wallet`) retorna as métricas agregadas para o dashboard

**Non-Goals:**
- Emissão ou transferência de Surreais a partir do dashboard (já existe em AdminTreasury)
- Histórico de transações por usuário no admin (escopo da aba Financeiro existente)
- Paginação da lista de usuários (escopo atual sem paginação)

## Decisions

### 1. Onde buscar os dados de saldo para a lista de usuários

**Decisão**: Adicionar nova ação `fetchUsersWithBalances` na Edge Function `api-members` que faz um join entre `profiles` e `wallets`.

**Alternativas consideradas**:
- **Option A — JOIN via Supabase PostgREST**: `profiles.select('*, wallet:wallets(balance)')`. Simples, mas exige policy RLS permissiva para leitura cruzada de wallets — não adequado, pois usuários comuns não devem ver saldos alheios.
- **Option B — Duas queries separadas no frontend**: buscar membros e saldos independentemente e mesclar no cliente. Funciona, mas dois round-trips e exposição de dados via RLS pública.
- **Option C (escolhida) — Query única na Edge Function com admin client**: a Edge Function já usa `supabaseAdmin` para `fetchUsers`. Estender essa query para incluir `wallet:wallets(balance)` usando o admin client (que bypass RLS) é seguro, eficiente e mantém o controle de acesso na camada de servidor.

### 2. Onde exibir o dashboard de métricas

**Decisão**: Nova aba **"Economia"** (ícone `BarChart`) no `AdminPanel.tsx`, adjacente à aba de Financeiro existente.

**Alternativas**:
- Dentro da aba de Financeiro existente: sobrepõe funcionalidades de auditoria de pagamentos.
- Página separada `/admin-economy`: aumenta complexidade de roteamento sem benefício.
- Nova aba no AdminPanel (escolhida): padrão existente no projeto, menor fricção de navegação.

### 3. Ação de métricas: api-members ou api-wallet?

**Decisão**: Nova ação `fetchEconomyStats` em `api-members`, pois o contexto é gestão de membros e seus ativos.

**Rationale**: A Edge Function `api-wallet` é focada em operações da carteira do próprio usuário. As métricas do dashboard são de natureza administrativa (cross-user), alinhadas ao escopo de `api-members`.

### 4. Estrutura de dados retornada

```typescript
// fetchUsersWithBalances → ProfileWithBalance[]
{
  id, full_name, email, avatar_url, roles, functions,
  role, created_at, email, village_id, language, theme,
  surreal_balance: number  // wallet.balance, null se sem carteira
}

// fetchEconomyStats → EconomyStats
{
  total_supply: number,         // soma de todos saldos de membros
  treasury_balance: number,     // saldo da wallet com profile_id IS NULL
  total_transactions: number,
  total_completed_tasks: number,
  top_contributors: Array<{     // top 10 por tarefas concluídas
    profile_id, full_name, avatar_url,
    completed_tasks: number, surreal_balance: number
  }>,
  top_holders: Array<{          // top 10 por saldo
    profile_id, full_name, avatar_url, surreal_balance: number
  }>
}
```

## Risks / Trade-offs

- **Performance**: `fetchUsersWithBalances` faz join com wallets para todos os usuários. Em comunidades grandes pode aumentar latência. → Mitigação: o join é simples (FK direta) e a lista de membros é tipicamente pequena (<100 usuários).
- **Usuários sem carteira**: Membros criados antes do sistema de wallets podem não ter linha em `wallets`. → Mitigação: usar `LEFT JOIN` e tratar `null` como `0.00` no frontend.
- **Consistência do saldo**: O saldo exibido é um snapshot no momento do fetch. Não há atualização em tempo real. → Aceito: o contexto admin é de auditoria/gestão, não de monitoramento em tempo real.
