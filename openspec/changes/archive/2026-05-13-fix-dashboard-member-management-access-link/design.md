## Context

O componente `Home.tsx` renderiza um grid de cartões (`homeCards`) que servem como atalhos para as principais áreas da plataforma. O cartão de Gerenciamento de Membros está atualmente configurado com um caminho estático que não reflete a estrutura atualizada do painel administrativo.

## Goals / Non-Goals

**Goals:**
- Redirecionar o usuário do Dashboard diretamente para a aba correta do Painel Admin.

**Non-Goals:**
- Remover a rota `/admin/members` neste momento (mantendo para retrocompatibilidade se houver links externos, embora deva ser desencorajado).

## Decisions

- **Uso de Query Params:** Utilizar o padrão `?tab=users` na URL para disparar a lógica de seleção de aba já existente no `AdminPanel.tsx`.

## Risks / Trade-offs

- [Nenhum risco significativo identificado] → A alteração é de baixo impacto e utiliza infraestrutura de roteamento já testada.
