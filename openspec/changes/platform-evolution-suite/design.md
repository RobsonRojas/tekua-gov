## Context

A plataforma atual realiza payouts instantâneos e possui uma UI que depende de re-fetch manual. A IA está exposta no frontend e não possui filtros de contexto robustos.

## Goals / Non-Goals

**Goals:**
- Implementar um sistema de "Audit Log" resiliente.
- Adicionar período de carência de 24h para novos payouts.
- Criar componentes Skeleton para melhorar a percepção de performance.
- Centralizar a IA em uma Edge Function segura.

**Non-Goals:**
- Reescrever o motor de votação.
- Implementar um novo sistema de autenticação.

## Decisions

### Database
- **Table `audit_logs`**: `id`, `actor_id`, `action`, `resource_type`, `resource_id`, `metadata`, `created_at`.
- **Column `available_at`**: Adicionada em `activities` ou tabela de transações. O saldo disponível (`balance`) só incluirá créditos onde `now() > available_at`.
- **Trigger `tr_audit_everything`**: Gatilho para monitorar mudanças em `profiles` (balanço) e `activities` (status).

### Frontend (Reatividade)
- **AuthContext Realtime**: Inscrição no canal `public:profiles` filtrado pelo `user_id` logado para atualizar o objeto `profile` e `balance` instantaneamente.
- **Skeleton Cards**: Criar `ActivityCardSkeleton` e `TopicCardSkeleton` para exibição durante `loading`.

### AI Architecture
- **Edge Function `ai-handler`**: Recebe o prompt do usuário, injeta um `system_prompt` que define as regras do agente, e chama o modelo (ex: GPT-4o). Retorna o stream ou texto sanitizado.

## Risks / Trade-offs

- **Complexidade do Saldo**: O cálculo do saldo disponível torna-se ligeiramente mais complexo (exige filtro por data).
- **Custo de Edge Functions**: Pequeno aumento no consumo de recursos do Supabase, mas justificado pela segurança.
