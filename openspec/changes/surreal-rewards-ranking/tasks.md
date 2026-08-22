# Implementation Tasks: Surreal Rewards Ranking

## 1. Database Migrations
- [x] Criar tabela `rewards` (id, title, description, image_url, cost, status, deadline, created_at) no Supabase.
- [x] Criar tabela `user_rewards` (id, user_id, reward_id, achieved_at) no Supabase.
- [x] Configurar RLS (Row Level Security) para as novas tabelas (leitura pública, escrita apenas admin para rewards; leitura própria para user_rewards).
- [x] Criar trigger/função no banco de dados que escute aumentos no saldo de surreais e garanta o prêmio automaticamente se a condição `saldo >= cost` for atendida para um prêmio ativo (e `deadline` não tiver expirado).

## 2. Backend / Edge Functions
- [x] Atualizar ou criar função para servir OpenGraph meta tags dinâmicas para a rota `/rewards/:rewardId/ranking` caso seja feito via SSR/Edge (se não for suportado nativamente pelo framework frontend) - *Será resolvido no Frontend via Helmet/Meta tags client-side.*
- [x] Criar Edge Function (agendada via pg_cron) para disparar notificações e emails periódicos para membros participarem de campanhas ativas e alertas de "últimos dias" para prêmios com `deadline`.

## 3. Frontend - Admin
- [x] Criar tela de CRUD de Prêmios (Admin) com listagem, criação e edição, incluindo campo opcional de Data Limite.
- [x] Integrar com Supabase Storage para upload da imagem/ícone do prêmio.

## 4. Frontend - Public Ranking Page
- [x] Criar rota `/rewards/:id/ranking`.
- [x] Implementar a UI da página de Ranking: Header do prêmio com título, imagem, descrição, meta de surreais e data limite (com timer regressivo, se houver).
- [x] Buscar e exibir a lista de membros ordenada pelo progresso em direção à meta do prêmio (os que já atingiram recebem destaque de "Garantido!").
- [x] Adicionar botão "Ganhar mais surreais" ou "Acessar Work Wall" que direcione para `/work-wall`.
- [x] Garantir responsividade e visual moderno.

## 5. Notification & Feedback
- [x] Integrar com o sistema de notificações (ou Toast) para avisar o usuário no momento em que ele atinge a pontuação.
- [x] Exibir os prêmios conquistados no perfil do usuário (Opcional/Complementar).
