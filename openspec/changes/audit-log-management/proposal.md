## Why

A tabela `audit_logs` crescerá indefinidamente à medida que a plataforma for usada, o que pode degradar a performance do banco de dados e aumentar os custos de armazenamento. É necessário implementar uma política de retenção e arquivamento para manter apenas os logs recentes ativos no banco principal.

## What Changes

- **Política de Retenção de Logs**: Definição de um período de 12 meses para logs ativos.
- **Processo de Arquivamento**: Exportação automática de logs antigos para um formato comprimido (JSON/CSV) ou uma tabela de "frio" (`audit_logs_archive`).
- **Limpeza Periódica (Pruning)**: Remoção física de registros da tabela principal após o arquivamento bem-sucedido.
- **Visão Histórica**: Ferramenta para administradores consultarem logs arquivados se necessário.

## Capabilities

### New Capabilities
- `audit-retention-policy`: Regras para determinar quando um log deve ser arquivado ou removido.
- `audit-archive-service`: Serviço para mover dados da tabela quente para a fria ou armazenamento externo.

### Modified Capabilities
- `audit-log-viewer`: O visualizador de logs agora deve permitir a seleção entre "Logs Ativos" e "Logs Arquivados".

## Impact

- **Database**: Criação da tabela `audit_logs_archive` (particionada ou não); novos jobs agendados (pg_cron) para limpeza.
- **Security**: Garantia de que os logs arquivados mantêm a mesma integridade e políticas de acesso (RLS).
- **Storage**: Redução do tamanho da tabela `public.audit_logs`.
