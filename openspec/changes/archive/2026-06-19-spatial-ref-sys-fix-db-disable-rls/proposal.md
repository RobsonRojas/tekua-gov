## Why

A tabela `public.spatial_ref_sys` (criada automaticamente pela extensão PostGIS) está exposta publicamente pelo PostgREST/Supabase sem que o Row-Level Security (RLS) esteja habilitado. Isso gera um alerta de segurança de auditoria no Supabase, pois todas as tabelas acessíveis publicamente por padrão devem possuir RLS habilitado para prevenir manipulação e exposição não controladas de dados do banco.

## What Changes

- Habilitar explicitamente o Row-Level Security (RLS) na tabela `public.spatial_ref_sys`.
- Definir uma política de acesso que permita leitura pública (`FOR SELECT USING (true)`) para que as bibliotecas e funções de geolocalização continuem lendo os metadados de projeção espacial, ao passo que todas as operações de escrita sejam negadas por padrão.

## Capabilities

### New Capabilities
<!-- Nenhuma nova funcionalidade é introduzida, apenas correções de segurança no banco de dados. -->

### Modified Capabilities
- `security-hardening`: Refinar o requisito de segurança do banco de dados para incluir a habilitação obrigatória de RLS em tabelas criadas por extensões (como PostGIS) que estejam expostas no esquema `public`.

## Impact

- Banco de dados Supabase (tabela `public.spatial_ref_sys`).
- Nova migração SQL em `supabase/migrations/`.
