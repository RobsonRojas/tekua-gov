# Spec: Surreal Rewards Ranking

## 1. Overview
Esta spec define o comportamento do sistema de criação, resgate automático e exibição de ranking para prêmios baseados em surreais acumulados.

## 2. Requirements

### 2.1. Gestão de Prêmios (Admin)
- O administrador deve poder cadastrar prêmios.
- Campos do prêmio: Título, Descrição, Imagem/Ícone, Custo (em Surreais), Status (Ativo/Inativo), Data Limite/Deadline (opcional).
- O admin deve poder editar e remover prêmios inativos.

### 2.2. Resgate Automático
- Quando um prêmio é criado, membros podem participar/opt-in (ou pode ser global, se configurado assim).
- O sistema deve verificar o saldo/ganhos de surreais dos membros em relação aos prêmios ativos.
- Assim que um membro atingir os surreais necessários para um prêmio, o prêmio deve ser marcado como "garantido/resgatado" para aquele membro automaticamente.
- O membro deve ser notificado sobre a conquista.

### 2.3. Página de Ranking e Compartilhamento
- Deve existir uma página pública/compartilhável `/rewards/:rewardId/ranking`.
- Esta página exibe:
  - Os detalhes do prêmio.
  - O ranking dos membros que estão concorrendo ou que já ganharam, baseado no progresso (surreais acumulados válidos para o prêmio).
  - Um layout dinâmico que destina posições (1º, 2º, 3º).
- A página deve possuir meta tags apropriadas (OG:Title, OG:Image, etc.) para bom visual em compartilhamento no WhatsApp, etc.
- A página deve possuir um botão claro: "Ganhar mais surreais" ou "Ir para a Work Wall", que direciona para a `/work-wall`.

### 2.4. Notificações e Engajamento
- O sistema deve permitir o envio de emails ou notificações push periódicas (lembretes) para convidar os usuários a participarem de campanhas ativas.
- Campanhas com Data Limite devem disparar alertas de "últimos dias" para incentivar o engajamento dos membros próximos de atingir a meta.

## 3. Data Model
- `rewards`: `id`, `title`, `description`, `cost`, `status`, `deadline` (timestamptz, nullable), `created_at`
- `user_rewards`: `user_id`, `reward_id`, `achieved_at`
