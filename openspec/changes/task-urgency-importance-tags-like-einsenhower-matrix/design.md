## Context

Atualmente, o sistema de tarefas (`activities` de tipo `task`) carece de priorização. Os usuários criam tarefas sem indicar o nível de urgência ou importância, o que dificulta a organização no mural. Além disso, não há um sistema de lembretes recorrentes para tarefas pendentes, o que pode levar ao esquecimento de demandas críticas.

## Goals / Non-Goals

**Goals:**
- Adicionar suporte a campos de Urgência e Importância (Matriz de Eisenhower) na tabela `activities`.
- Implementar visualização diferenciada no frontend para esses níveis de prioridade.
- Criar um mecanismo de configuração de cadência de notificações no `governance_settings`.
- Implementar um motor de disparos de lembretes baseado em intervalos configuráveis.

**Non-Goals:**
- Alterar o sistema de execução de tarefas (assumir, concluir).
- Criar um sistema de chat interno para tarefas.

## Decisions

### 1. Data Model: Prioridade nas Atividades
Adicionaremos as colunas `urgency` (boolean) e `importance` (boolean) à tabela `activities`.
- **Rationale**: Dois booleanos são suficientes para mapear os 4 quadrantes da Matriz de Eisenhower de forma simples e eficiente para consultas.
- **Campos Adicionais**: `last_reminder_at` (timestamptz) para controlar o fluxo de notificações.

### 2. Configurações de Frequência
Adicionaremos a coluna `task_reminder_frequencies` (jsonb) à tabela `governance_settings`.
- **Estrutura sugerida**:
  ```json
  {
    "urgent_important": "1 hour",
    "urgent_not_important": "1 day",
    "not_urgent_important": "1 day",
    "not_urgent_not_important": "1 week"
  }
  ```
- **Rationale**: JSONB permite flexibilidade para adicionar novos tipos de lembretes ou ajustar a estrutura sem migrações complexas. O uso de strings compatíveis com o `INTERVAL` do Postgres facilita a lógica no backend.

### 3. Motor de Lembretes (Edge Function + Cron)
Utilizaremos uma Supabase Edge Function disparada por um cron job (ex: a cada 30 minutos ou 1 hora).
- **Lógica**:
  1. Busca tarefas `open` ou `in_progress`.
  2. Compara `now() - last_reminder_at` (ou `created_at` se nulo) com a frequência configurada no quadrante correspondente.
  3. Se o intervalo expirou, dispara a notificação (via `notifications_hub`) e atualiza `last_reminder_at`.

### 4. Interface de Usuário
- **Criação/Edição**: Dois switches ou um seletor de quadrante 2x2.
- **Mural**: Badges ou bordas coloridas nos cards (ex: Vermelho para Urgente & Importante).
- **Admin**: Nova seção em "Configurações de Governança" para as frequências.

## Risks / Trade-offs

- **Risco**: Sobrecarga de notificações (Spam).
  - **Mitigação**: Garantir que o `last_reminder_at` seja atualizado corretamente e que o usuário possa desabilitar lembretes globalmente em seu perfil (se já existir essa opção).
- **Trade-off**: Uso de Cron externo vs PG_CRON.
  - **Decisão**: Preferir PG_CRON se disponível no Supabase local/nuvem para manter a lógica o mais próximo possível dos dados.
