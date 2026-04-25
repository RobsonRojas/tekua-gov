## Context

Atualmente, o fluxo de trabalho no sistema é iniciado pelo trabalhador que registra uma contribuição já realizada (`RegisterWork`). Para permitir que membros demandem serviços, precisamos de um fluxo inverso: o solicitante cria uma tarefa aberta e, posteriormente, alguém a realiza.

## Goals / Non-Goals

**Goals:**
- Permitir que qualquer membro crie uma tarefa com status 'open'.
- Permitir a definição de um valor de recompensa em Surreal.
- Reutilizar a infraestrutura de `activities` e `api-work`.

**Non-Goals:**
- Implementar o fluxo de aceitação de tarefas (pickup) nesta fase.
- Implementar controle de saldo (escrow) imediato (será validado na finalização).

## Decisions

- **Nova Rota**: `/create-demand` para o formulário de criação.
- **Action da API**: Nova action `submitActivity` na Edge Function `api-work` que suporte o status 'open'.
- **Modelo de Dados**: Utilizar a tabela `activities` com `worker_id` nulo e `status = 'open'`.

## Risks / Trade-offs

- **Spam**: Qualquer membro pode criar tarefas. Mitigação: Auditoria de admin ou social validation no fechamento.
- **Saldo Insuficiente**: O proponente pode criar uma tarefa sem ter saldo. Decisão: A validação final de transferência ocorrerá no fechamento da tarefa, similar ao sistema atual.
