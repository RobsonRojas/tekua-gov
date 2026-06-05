## Why

Usuários administradores estão enfrentando erros `400 (Bad Request)` com a mensagem `new row violates row-level security policy` ao tentar fazer upload de documentos oficiais para o bucket `official-docs`. Isso ocorre porque a política de RLS `official-docs-admin` no Supabase valida apenas a coluna legada de texto simples `role = 'admin'` na tabela `profiles`, enquanto a plataforma evoluiu para armazenar os papéis em uma coluna do tipo array `roles TEXT[]` (ex: `['admin', 'transversal_council']`). Administradores com outras atribuições principais (como Jordi Pascoal com `role = 'transversal_council'` e `roles = ['admin', 'transversal_council']`) acabam tendo seus uploads bloqueados.

## What Changes

- Atualizar a política de RLS `official-docs-admin` no Supabase Storage (`storage.objects`) para verificar tanto a coluna legada `role = 'admin'` quanto a presença de `'admin'` no array `roles` (`'admin' = ANY(roles)`), alinhando com a lógica já adotada no bucket `member-photos` e nas Edge Functions.
- Adicionar uma migração de banco de dados para recriar a política com a verificação de permissões corrigida.

## Capabilities

### New Capabilities
<!-- Nenhuma nova funcionalidade é introduzida, apenas correções de segurança no banco de dados. -->

### Modified Capabilities
- `storage-policies`: Atualizar as regras de acesso e as políticas de segurança de armazenamento para o bucket `official-docs`, garantindo que qualquer usuário com a atribuição de `admin` em seu array de papéis (`roles`) tenha permissão de escrita e gerenciamento.

## Impact

- Banco de dados Supabase (política RLS `official-docs-admin` na tabela `storage.objects`).
- Nova migração SQL em `supabase/migrations/`.
