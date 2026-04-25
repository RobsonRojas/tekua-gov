## Context

A tabela `audit_logs` captura todas as mudanças críticas. Em um ambiente de produção com muitos usuários, ela pode acumular milhões de linhas rapidamente. O Supabase (Postgres) suporta particionamento de tabelas, o que é ideal para gerenciar dados temporais.

## Goals / Non-Goals

**Goals:**
- Implementar particionamento por mês na tabela `audit_logs`.
- Criar um mecanismo para "desacoplar" partições antigas e movê-las para um esquema de arquivamento.
- Automatizar a criação de novas partições e a expiração das antigas.

**Non-Goals:**
- Implementar arquivamento em S3/Cold Storage nesta fase (manteremos tudo no Postgres, mas em tabelas separadas).
- Alterar o esquema das colunas existentes.

## Decisions

### 1. Particionamento por Tabela (Declarative Partitioning)
- **Racional**: O particionamento nativo do Postgres (`PARTITION BY RANGE (created_at)`) permite remover dados antigos instantaneamente (`DROP TABLE partition_name`) sem causar locks pesados na tabela principal.

### 2. Job de Manutenção Automatizado
- **Racional**: Usaremos a extensão `pg_cron` (disponível no Supabase) para executar uma função mensal que:
    1. Cria a partição para o próximo mês.
    2. Move a partição de 13 meses atrás para o esquema `archive`.

### 3. Acesso Unificado via View
- **Racional**: Para não quebrar o dashboard de administração, criaremos uma view `vw_audit_logs_all` que faz um `UNION ALL` entre a tabela ativa e a tabela de arquivo, permitindo buscas históricas completas quando necessário.

## Risks / Trade-offs

- **[Risco] Interrupção durante a migração para particionamento** → **[Mitigação]** A migração exige renomear a tabela original e criar a nova estrutura. Faremos isso em uma janela de manutenção curta.
- **[Risco] Complexidade de Queries em View Unificada** → **[Mitigação]** Garantir que as queries na view sempre incluam filtros de `created_at` para permitir que o Postgres use a poda de partições (partition pruning).
