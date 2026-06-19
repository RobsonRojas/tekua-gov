## Context

A tabela `public.spatial_ref_sys` é gerada pela extensão PostGIS para armazenar definições dos sistemas de referência espacial (como o EPSG:4326 usado pelo PostGIS). Por estar no schema `public` (exposto ao PostgREST), o linter do Supabase acusa a falta de habilitação de RLS.

## Goals / Non-Goals

**Goals:**
- Habilitar RLS na tabela `public.spatial_ref_sys`.
- Definir uma política `FOR SELECT` que permita acesso de leitura pública (`true`) para todos.

**Non-Goals:**
- Permitir qualquer escrita ou modificação (INSERT, UPDATE, DELETE) pública ou autenticada na tabela.
- Habilitar RLS em outras tabelas do PostGIS que não estejam expostas ou que não gerem alertas.

## Decisions

### Decisão 1: Comando de Habilitação do RLS e Política de Leitura Pública
- **Abordagem**: Criar um script SQL de migração executando:
  ```sql
  ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys
      FOR SELECT USING (true);
  ```
- **Raciocínio**: A tabela é meramente informativa e somente leitura. Qualquer restrição no SELECT poderia quebrar funções de geolocalização do PostGIS (como `ST_Transform` ou `ST_GeomFromText`), portanto, a leitura irrestrita (`true`) é necessária e segura. A falta de políticas de escrita assegura que qualquer tentativa de alteração seja negada pelo banco de dados por padrão.

### Decisão 2: Nova Migração no Supabase
- **Abordagem**: Adicionar um arquivo de migração na pasta `supabase/migrations/` (ex: `20260605000001_spatial_ref_sys_rls.sql`).

## Risks / Trade-offs

- **[Risco] Interrupção das consultas espaciais** → Caso a política SELECT não seja criada corretamente ou bloqueie certos papéis, consultas espaciais que dependem dos SRS do PostGIS podem falhar.
  - *Mitigação*: A política `USING (true)` garante leitura incondicional a todas as conexões, mantendo total compatibilidade com PostGIS.
