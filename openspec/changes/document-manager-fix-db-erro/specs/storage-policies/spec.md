## MODIFIED Requirements

### Requirement: Segurança de Documentos Privados
Documentos marcados como "Restritos" no `official-docs` **MUST** ser acessíveis apenas por membros com o papel `admin` (definido na coluna `role` ou contido no array `roles` de seu perfil).

#### Scenario: Acesso negado a documento restrito
- **WHEN** Um usuário com papel `member` (e sem a permissão `admin` em seu array de papéis) tenta acessar a URL direta de um PDF restrito.
- **THEN** O Supabase Storage retorna erro 403 (Forbidden) via políticas de RLS de objeto.

#### Scenario: Acesso concedido a administrador com múltiplos papéis
- **WHEN** Um usuário com `role = 'transversal_council'` e contendo `'admin'` em seu array `roles` tenta fazer upload de um documento para o bucket `official-docs`.
- **THEN** O Supabase Storage aceita a requisição e realiza o upload do arquivo com sucesso.
