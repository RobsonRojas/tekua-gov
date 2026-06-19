## Why

A view `public.vw_audit_logs_all` está definida com o comportamento padrão de `SECURITY DEFINER` (implicitamente por não possuir a opção `security_invoker`), contornando as políticas de Row-Level Security (RLS) da tabela `public.audit_logs`. Isso expõe logs de auditoria sensíveis de outros usuários a qualquer usuário que consulte a view, violando os princípios de privilégio mínimo e segurança da plataforma.

## What Changes

- Recriar a view `public.vw_audit_logs_all` com a propriedade `WITH (security_invoker = true)` no PostgreSQL/Supabase.
- Garantir que as consultas a essa view respeitem e apliquem estritamente as políticas de RLS do usuário que as invoca.

## Capabilities

### New Capabilities
<!-- Nenhuma nova funcionalidade é introduzida, apenas correções de segurança no banco de dados. -->

### Modified Capabilities
- `security-hardening`: Adicionar requisito de que todas as views que servem dados sensíveis das tabelas com RLS habilitado devem ser definidas com `security_invoker = true` para forçar a execução sob o contexto de segurança e RLS do usuário que realiza a consulta.

## Impact

- Banco de dados Supabase (definição da view `public.vw_audit_logs_all`).
- Nova migração SQL em `supabase/migrations/`.
