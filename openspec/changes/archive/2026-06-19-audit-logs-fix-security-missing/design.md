## Context

A view `public.vw_audit_logs_all` é atualmente definida como uma view padrão, que sob a configuração default do PostgreSQL se comporta de maneira similar a `SECURITY DEFINER`. Isso significa que ela utiliza as permissões do criador da view para ler a tabela `public.audit_logs`, contornando as políticas de RLS e permitindo que qualquer usuário autenticado leia registros de auditoria pertencentes a outros usuários.

## Goals / Non-Goals

**Goals:**
- Recriar a view `public.vw_audit_logs_all` utilizando a opção `WITH (security_invoker = true)`.
- Assegurar que as consultas a `public.vw_audit_logs_all` passem a respeitar e aplicar estritamente as políticas de RLS configuradas na tabela base `public.audit_logs` para o usuário executor.

**Non-Goals:**
- Alterar as políticas de RLS existentes na tabela `public.audit_logs`.
- Modificar colunas, tipos de dados ou as regras de negócio associadas aos logs de auditoria.

## Decisions

### Decisão 1: Recriar a view usando `WITH (security_invoker = true)`
- **Abordagem**: Utilizar um script SQL de migração para executar `DROP VIEW IF EXISTS public.vw_audit_logs_all;` e em seguida `CREATE OR REPLACE VIEW public.vw_audit_logs_all WITH (security_invoker = true) AS SELECT * FROM public.audit_logs;`.
- **Raciocínio**: A propriedade `security_invoker = true` (introduzida no PostgreSQL 15) instrui o banco de dados a aplicar as políticas de RLS e as permissões do usuário que está consultando a view, mitigando completamente a vulnerabilidade de vazamento de dados.
- **Alternativa Considerada**: `ALTER VIEW ... SET (security_invoker = true)`. Contudo, fazer o `DROP` e `CREATE` garante uma migração idempotente e limpa que acompanha o padrão das migrações anteriores do repositório.

### Decisão 2: Nova Migração no Supabase
- **Abordagem**: Criar um novo arquivo de migração na pasta `supabase/migrations/` com timestamp atualizado (ex: `20260605000000_audit_logs_view_security_invoker.sql`) para aplicar a alteração no banco de dados.

## Risks / Trade-offs

- **[Risco] Overhead de Performance** → A aplicação das políticas de RLS em tempo de execução de consulta na view pode acrescentar um pequeno overhead no planejamento da query.
  - *Mitigação*: A tabela `public.audit_logs` utiliza índices adequados para `actor_id` (chave de filtragem do RLS) e o volume de consultas nessa view por usuários comuns é baixo, tornando o impacto de performance imperceptível.
