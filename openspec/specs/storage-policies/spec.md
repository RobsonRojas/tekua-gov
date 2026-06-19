# storage-policies Specification

## Purpose
TBD - created by archiving change storage-media-policies. Update Purpose after archive.
## Requirements
### Requirement: Gestão de Mídia e Otimização de Storage
O sistema **SHALL** implementar políticas rígidas de armazenamento para garantir a sustentabilidade dos recursos do servidor.

#### Scenario: Restrição de tipo de arquivo
- **WHEN** Um usuário tenta fazer upload de um arquivo com extensão não suportada (ex: `.zip`) como evidência de tarefa.
- **THEN** O sistema impede o upload e informa que apenas imagens (.jpg, .png, .webp) são aceitas.

#### Scenario: Otimização automática de evidências
- **WHEN** O usuário seleciona uma imagem de 10MB para upload.
- **THEN** O sistema realiza a compressão no lado do cliente para menos de 1MB antes de enviar ao servidor.

### Requirement: Segurança de Documentos Privados
Documentos marcados como "Restritos" no `official-docs` **MUST** ser acessíveis apenas por membros com o papel `admin` (definido na coluna `role` ou contido no array `roles` de seu perfil).

#### Scenario: Acesso negado a documento restrito
- **WHEN** Um usuário com papel `member` (e sem a permissão `admin` em seu array de papéis) tenta acessar a URL direta de um PDF restrito.
- **THEN** O Supabase Storage retorna erro 403 (Forbidden) via políticas de RLS de objeto.

#### Scenario: Acesso concedido a administrador com múltiplos papéis
- **WHEN** Um usuário com `role = 'transversal_council'` e contendo `'admin'` em seu array `roles` tenta fazer upload de um documento para o bucket `official-docs`.
- **THEN** O Supabase Storage aceita a requisição e realiza o upload do arquivo com sucesso.

