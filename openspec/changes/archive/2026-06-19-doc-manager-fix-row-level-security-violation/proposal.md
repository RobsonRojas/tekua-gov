## Why

A política de RLS "Admins can manage documents" na tabela `public.documents` está restrita a verificar apenas a coluna única `profiles.role = 'admin'`. Isso causa falha na gravação de metadados de documentos oficiais (violação de RLS) para administradores secundários ou com múltiplos cargos cujas credenciais de administrador estão descritas no array `roles` em vez da coluna legacy `role`.

## What Changes

- Atualizar a política RLS "Admins can manage documents" da tabela `public.documents` para dar suporte ao array `roles`, validando tanto `role = 'admin'` quanto `'admin' = ANY(roles)`.
- Garantir compatibilidade retroativa para todos os tipos de configurações de cargos administrativos.

## Capabilities

### Modified Capabilities
- `admin-docs`: Aprimoramento da política de segurança RLS para a tabela de documentos oficiais para suportar múltiplos cargos.

## Impact

- Afeta a tabela de banco de dados `public.documents` e suas políticas de segurança de linha (RLS).
- Introduz uma nova migração SQL no diretório `supabase/migrations/` para atualizar a definição da política.
