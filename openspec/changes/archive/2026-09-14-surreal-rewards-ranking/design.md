# Design: Surreal Rewards Ranking

## 1. Architecture
- **Banco de Dados (Supabase):** Novas tabelas `rewards` e `user_rewards`. Adição de um trigger ou função cron para verificar se os membros atingiram os surreais requeridos para prêmios ativos. Alternativamente, essa checagem pode ser feita reativamente a cada transação de surreais inserida (usando trigger no BD).
- **Backend/Edge Functions:** 
  - Uma rota no backend/edge functions (se necessário) para lidar com a meta-tags dinâmicas para compartilhamento, ou usar renderização no servidor (SSR) ou Next.js (se for o caso da stack) para servir a página de `/rewards/:rewardId/ranking`.
  - Uma função CRON no Supabase Edge Functions para disparar lembretes periódicos e alertas de "últimos dias" das campanhas ativas.
- **Frontend:**
  - Painel de Administração de Prêmios (CRUD).
  - Página de Ranking Compartilhável (`/rewards/:rewardId/ranking`).

## 2. API / Database Changes

### Tables
**Table `rewards`**
- `id`: uuid (PK)
- `title`: text
- `description`: text
- `image_url`: text
- `cost`: integer
- `status`: text (active/inactive)
- `deadline`: timestamptz (nullable)
- `created_at`: timestamptz

**Table `user_rewards`**
- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `reward_id`: uuid (FK)
- `achieved_at`: timestamptz

### Trigger / Logic
- Trigger na tabela de balanço de surreais (ou carteira): sempre que o saldo aumentar, verificar prêmios ativos que não tenham expirado (`deadline` nulo ou > agora). Se o novo saldo >= `reward.cost` e o usuário ainda não possui o prêmio, inserir em `user_rewards` e emitir notificação (por exemplo, na tabela `notifications`).

## 3. UI/UX
- **Ranking Page:** Uma lista ordenada por saldo de surreais (ou surreais ganhos no período do prêmio). Layout premium e atrativo, usando as cores da Tekuá. O card do usuário logado deve ter destaque.
- **Botão Work Wall:** Fixo e bem visível (ex: "Execute tarefas e suba no ranking", link para `/work-wall`).
- **Social Sharing:** Tags OpenGraph preenchidas com informações do prêmio e talvez o top 1 atual.
