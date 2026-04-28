## Context

A plataforma Tekuá já possui uma infraestrutura básica para notificações Push (Service Worker e tabela `push_subscriptions`). No entanto, a lógica de disparo é manual ou inexistente para o fluxo de tarefas. Este design visa automatizar esses alertas e introduzir o canal de Email para garantir que os membros não percam atualizações importantes, especialmente quando estão offline do portal.

## Goals / Non-Goals

**Goals:**
- Automatizar o envio de notificações push e email para eventos críticos do ciclo de vida de tarefas/demandas.
- Centralizar a lógica de roteamento e templates em uma Edge Function dedicada.
- Garantir a entrega assíncrona para não impactar a performance do banco de dados.

**Non-Goals:**
- Implementar central de preferências de notificações (nesta fase, as notificações seguem o consentimento global de notificações).
- Notificações de chat ou comentários (foco exclusivo em status de tarefas).

## Decisions

### 1. Gatilhos via Database Webhooks (Postgres Triggers)
- **Decisão**: Usar triggers no banco de dados para capturar `INSERT` e `UPDATE` nas tabelas relevantes e invocar a Edge Function de notificação.
- **Racional**: Garante que qualquer alteração no estado dos dados (via Web, Mobile ou Admin) gere o alerta, mantendo a integridade do fluxo de governança independentemente da interface.

### 2. Motor de Notificações Centralizado (Edge Function)
- **Decisão**: Criar a função `notify-engine` que recebe o evento e o payload bruto, identifica os destinatários (baseado no `creator_id`, `worker_id` ou todos os membros) e formata a mensagem para múltiplos canais.
- **Racional**: Evita duplicar lógica de templates em múltiplos triggers e facilita a adição de novos canais no futuro.

### 3. Integração com Resend para Emails
- **Decisão**: Utilizar o serviço Resend para o envio de emails transacionais.
- **Racional**: Oferece uma API simples, templates amigáveis para desenvolvedores e integração nativa com o ecossistema Supabase/Vite.

## Risks / Trade-offs

- **[Risco] Sobrecarga de Notificações**: O disparo de "Nova Demanda" para todos os membros pode ser visto como spam se houver muitas criações.
    - **Mitigação**: Agrupar notificações ou limitar o disparo global apenas para demandas que atingirem um status de "Publicada".
- **[Trade-off] Dependência Externa**: O sistema depende da disponibilidade do Resend e dos serviços de Push do navegador.
    - **Decisão**: Falhas no envio de notificações não devem impedir a persistência dos dados no banco (uso de chamadas assíncronas via `pg_net`).
