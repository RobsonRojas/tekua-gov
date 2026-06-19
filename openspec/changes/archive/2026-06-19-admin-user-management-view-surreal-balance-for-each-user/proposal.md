## Why

O painel administrativo de usuários não exibe o saldo de Surreais de cada membro, obrigando o administrador a alternar entre o painel de usuários e a área financeira para obter uma visão consolidada da economia da associação. A falta de dados agregados (saldo por membro, total emitido, tarefas concluídas por usuário) impede a gestão eficiente e a prestação de contas da moeda comunitária.

## What Changes

- Adicionar coluna **Saldo SR$** na tabela de usuários do painel administrativo (`AdminPanel.tsx`), exibindo o saldo atual de Surreais de cada membro
- Criar uma aba ou seção de **Dashboard Financeiro** no painel admin com métricas agregadas:
  - Total de Surreais emitidos na plataforma (supply circulante)
  - Saldo do Tesouro
  - Número de tarefas concluídas por usuário (ranking de contribuidores)
  - Distribuição de Surreais por membro (top N holders)
  - Total de transações realizadas
- A lista de usuários passa a buscar dados de `wallets` junto com os `profiles` via join na Edge Function `api-members`

## Capabilities

### New Capabilities

- `admin-surreal-balance-overview`: Visualização do saldo de Surreais por usuário na lista de membros do painel administrativo e dashboard com métricas da economia interna da associação (supply total, tesouro, top contribuidores)

### Modified Capabilities

- `admin-panel`: A tela de gerenciamento de usuários passa a exibir o saldo de Surreais de cada membro como coluna adicional na tabela
- `member-management`: A listagem de membros passa a incluir dados financeiros (saldo SR$) junto com os dados de perfil e permissões

## Impact

- **Arquivos modificados**: `src/pages/AdminPanel.tsx`, `supabase/functions/api-members/index.ts`
- **Sem breaking changes**: a coluna de saldo é aditiva — não remove nem altera dados existentes
- **Dependências**: tabela `wallets` já existente; função `api-members` já existe e precisará incluir join com `wallets`
- **Permissões**: leitura de saldos de outros usuários é exclusiva para admins (via Edge Function com validação de role)
