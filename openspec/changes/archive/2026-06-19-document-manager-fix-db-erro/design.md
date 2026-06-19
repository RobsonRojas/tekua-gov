## Context

A política de segurança `official-docs-admin` na tabela `storage.objects` do Supabase restringe o acesso completo ao bucket `official-docs` para usuários cujo perfil tenha a coluna `role` (singular) igual a `'admin'`. No entanto, a plataforma evoluiu para suportar múltiplos papéis através do array `roles` na tabela `profiles`. Como resultado, administradores que possuem outra função principal na coluna `role` (por exemplo, `'transversal_council'`), mas que contêm `'admin'` no array `roles`, têm seus uploads de documentos oficiais negados por violação de RLS (erro 400 Bad Request).

## Goals / Non-Goals

**Goals:**
- Atualizar a política de segurança RLS `official-docs-admin` na tabela `storage.objects`.
- Alinhar a verificação com a lógica adotada no bucket `member-photos-admin` e no restante da plataforma, validando se o usuário possui a coluna `role = 'admin'` ou o elemento `'admin'` contido em `roles`.

**Non-Goals:**
- Alterar as permissões de acesso para membros comuns (política `official-docs-select`).
- Modificar o tamanho máximo ou extensões de arquivos aceitos configurados no bucket.

## Decisions

### Decisão 1: Atualizar a política RLS no banco de dados
- **Abordagem**: Criar um script SQL de migração executando:
  ```sql
  DROP POLICY IF EXISTS "official-docs-admin" ON storage.objects;
  CREATE POLICY "official-docs-admin" ON storage.objects
  FOR ALL USING (
      bucket_id = 'official-docs' 
      AND (
          SELECT role = 'admin' OR 'admin' = ANY(roles) 
          FROM public.profiles 
          WHERE id = auth.uid()
      )
  );
  ```
- **Raciocínio**: Esta lógica é idempotente, segura e perfeitamente compatível com o design multi-papéis da plataforma. Ela resolve o problema de administradores com múltiplos papéis sem enfraquecer a segurança geral.

### Decisão 2: Nova Migração no Supabase
- **Abordagem**: Criar um arquivo de migração em `supabase/migrations/20260605000002_fix_official_docs_admin_policy.sql`.

## Risks / Trade-offs

- **[Risco] Cache de sessão ou instabilidade de permissão** → Alterar políticas de armazenamento requer garantia de que a verificação de RLS no Supabase Storage não apresente latência na leitura de perfis.
  - *Mitigação*: O Supabase resolve o sub-select localmente na mesma transação. A tabela `profiles` possui índice na chave primária `id`, garantindo tempo de resposta na escala de microsegundos.
