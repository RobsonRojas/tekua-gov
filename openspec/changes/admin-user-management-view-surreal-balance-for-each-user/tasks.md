## 1. Edge Function `api-members` (Novas Queries)

- [x] 1.1 Em `supabase/functions/api-members/index.ts`, adicionar novo `case 'fetchUsersWithBalances'` que verifica se o requester tem papel `admin` usando `supabaseAdmin`
- [x] 1.2 No caso `fetchUsersWithBalances`, executar query no `supabaseAdmin` fazendo join entre `profiles` e `wallets` via `select('*, wallet:wallets(balance)')` para retornar todos os perfis com o campo `surreal_balance` (ou `null` se sem carteira)
- [x] 1.3 Mapear o resultado para incluir `surreal_balance: wallet?.balance ?? 0` no objeto retornado para cada membro

## 2. Estatísticas de Economia (Edge Function)

- [x] 2.1 Em `supabase/functions/api-members/index.ts`, adicionar novo `case 'fetchEconomyStats'` com verificação de role `admin`
- [x] 2.2 Implementar as seguintes queries usando `supabaseAdmin`:
  - `totalCirculating`: Soma de `balance` de todos os `wallets` cujo `profile_id IS NOT NULL`
  - `treasuryBalance`: `balance` do `wallet` cujo `profile_id IS NULL`
  - `totalTransactions`: Count da tabela `ledger_entries`
- [x] 2.3 Implementar query de top 10 contribuidores: `SELECT worker_id, COUNT(*) as completed_tasks FROM activities WHERE status = 'completed' AND worker_id IS NOT NULL GROUP BY worker_id ORDER BY completed_tasks DESC LIMIT 10`, depois enriquecer com `full_name`, `avatar_url` e `surreal_balance` via join com `profiles` e `wallets`
- [x] 2.4 Implementar query de top 10 holders: `SELECT profile_id, balance FROM wallets WHERE profile_id IS NOT NULL ORDER BY balance DESC LIMIT 10`, enriquecida com `full_name` e `avatar_url` de `profiles`
- [x] 2.5 Retornar o objeto `EconomyStats` consolidado com todos os campos acima

## 3. Hook e Types (`useMembers.ts`)

- [x] 3.1 Em `src/hooks/useMembers.ts` (ou equivalente), adicionar função `fetchMembersWithBalances()` que chama `apiClient.invoke('api-members', 'fetchUsersWithBalances', {})` e retorna `ProfileWithBalance[]`
- [x] 3.2 Adicionar função `fetchEconomyStats()` que chama `apiClient.invoke('api-members', 'fetchEconomyStats', {})` e retorna `EconomyStats`
- [x] 3.3 Definir os tipos TypeScript `ProfileWithBalance` e `EconomyStats` em `src/types/` (ou inline no hook) conforme estrutura definida no design

## 4. Atualização: Gerenciamento de Usuários

- [x] 4.1 Em `src/pages/AdminPanel.tsx`, na aba "Gerenciamento de Usuários", substituir a chamada existente de `fetchUsers` por `fetchMembersWithBalances` para que os dados já incluam o saldo
- [x] 4.2 Adicionar cabeçalho de coluna "Saldo SR$" na tabela de membros, após a coluna "Status"
- [x] 4.3 Renderizar o saldo de cada membro na célula correspondente, formatado como `{balance.toFixed(2)} SR$`, com tratamento para `null`/`undefined` exibindo `0,00 SR$`
- [x] 4.4 Garantir que a coluna de saldo seja visível apenas para usuários com papel `admin` (condição já existe para a aba inteira — verificar se é suficiente)

## 5. Criação: Nova Aba "Economia"

- [x] 5.1 Em `src/pages/AdminPanel.tsx`, adicionar nova aba "Economia" com ícone `BarChart` (ou `TrendingUp`) do lucide-react, posicionada entre as abas "Financeiro" e "Auditoria de Pagamentos"
- [x] 5.2 Criar componente `EconomyTab` (pode ser inline ou em `src/pages/components/EconomyTab.tsx`) que ao ser montado chama `fetchEconomyStats()`
- [x] 5.3 Implementar card de **Resumo Financeiro** exibindo: Total em Circulação, Saldo do Tesouro e Total de Transações, usando o mesmo estilo visual dos cards existentes no AdminPanel
- [x] 5.4 Implementar seção **Top Contribuidores** com lista rankeada de até 10 membros, exibindo: posição, avatar, nome, quantidade de tarefas concluídas e saldo SR$
- [x] 5.5 Implementar seção **Top Holders** com lista de até 10 membros com maior saldo, exibindo: posição, avatar, nome e saldo SR$
- [x] 5.6 Adicionar estado de loading com skeleton/spinner durante o carregamento dos dados e estado de erro com mensagem descritiva caso a API falhe

## 6. Validação

- [x] 6.1 Verificar localmente (com Supabase rodando) que a coluna "Saldo SR$" aparece corretamente na lista de usuários do AdminPanel com saldos reais
- [x] 6.2 Verificar que a aba "Economia" carrega e exibe corretamente métricas de supply total, tesouro, top contribuidores e top holders
- [x] 6.3 Verificar que usuário com papel `member` não consegue acessar `fetchUsersWithBalances` nem `fetchEconomyStats` (deve receber erro `Forbidden`)
- [x] 6.4 Verificar que membros sem carteira exibem `0,00 SR$` sem erros na UI
