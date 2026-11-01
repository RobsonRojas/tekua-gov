## REMOVED Requirements

### Requirement: Task Moderation Permissions
**Reason**: A etapa de moderação de atividades foi removida. Não existe mais coluna de Moderação nem fluxo de aprovação/rejeição de tarefas; novas tarefas e demandas nascem com status `open`.
**Migration**: Nenhuma ação do usuário é necessária. Atividades existentes em `pending_approval` são migradas para `open` (tarefas/demandas) ou `pending_validation` (contribuições). Consumidores que chamavam a ação `moderateActivity` deixam de ter essa rota disponível.

### Requirement: Localized Moderation Labels
**Reason**: Não existem mais ações de aprovar/rejeitar tarefas, portanto os rótulos localizados de moderação não têm uso.
**Migration**: Remover as chaves de tradução `work.moderation`, `work.pending_approval` e `work.moderationSuccess`. Nenhuma ação do usuário é necessária.
