## Context

Atualmente, o processo de criação de tarefas (demandas) é agnóstico quanto ao executor. O campo `worker_id` na tabela `activities` é preenchido apenas quando um membro assume a tarefa manualmente através do mural. Esta mudança visa permitir que administradores e conselheiros "atribuam" tarefas diretamente.

## Goals / Non-Goals

**Goals:**
- Permitir a atribuição de um executor no momento da criação da demanda por perfis autorizados.
- Permitir a edição do executor em tarefas existentes por perfis autorizados.
- Automatizar a transição para `in_progress` quando um executor é pré-definido.

**Non-Goals:**
- Alterar o sistema de recompensas ou validação.
- Notificar o usuário atribuído via e-mail nesta fase (será usado o sistema de notificações interno existente).

## Decisions

### 1. Seletor de Usuário no Frontend
- **O que**: Utilizar um componente de `Autocomplete` ou `Select` (preferencialmente reutilizando o que existe em `MemberManagement` ou `RegisterWork`) em `CreateDemand.tsx`.
- **Por que**: Para facilitar a busca por nome/email em uma base de membros que pode ser grande.
- **Autorização**: O campo será renderizado condicionalmente com base no array `profile.roles`.

### 2. Atualização da API e RPC
- **API (Edge Function)**: Atualizar `supabase/functions/api-work/index.ts` para aceitar `workerId` nos payloads de `createActivity` e `submitActivity`.
- **RPC (SQL)**: Atualizar a função `submit_activity` (se necessário, ou usar o `api-work` para gerenciar a inserção direta) para persistir o `worker_id`.

### 3. Lógica de Status na Moderação
- **O que**: No handler `moderateActivity` (ou na função de ativação da tarefa), adicionar uma verificação:
  - Se `action === 'approve'` E `worker_id IS NOT NULL`, então `status := 'in_progress'`.
  - Caso contrário, `status := 'open'`.
- **Por que**: Para que a tarefa atribuída apareça imediatamente como "em execução" para o membro escolhido, sem precisar ser "assumida" novamente no mural.

## Risks / Trade-offs

- **[Risco]** Atribuição de tarefa a membro inativo ou sem conhecimento. → **[Mitigação]** Restringir a funcionalidade a papéis de gestão (Admin/Conselho) que possuem governança sobre a operação.
- **[Trade-off]** Complexidade no componente `CreateDemand`. → **[Mitigação]** Manter o componente modular e isolar o seletor de usuário.
