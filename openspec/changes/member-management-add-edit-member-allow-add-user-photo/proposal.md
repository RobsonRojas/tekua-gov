## Why

Membros da comunidade e administradores se beneficiam de uma identificação visual clara no mural de trabalhos e em toda a governança do sistema. Atualmente, a criação de novos membros e a edição de membros existentes não permite a inclusão de uma foto de perfil (avatar). Esta proposta visa integrar a capacidade de envio e exibição de fotos de usuários no fluxo de administração de membros.

## What Changes

- **Upload de Fotos**: Possibilidade de fazer upload de fotos de perfil (avatar) nos modais de Novo Membro e Edição de Membro.
- **Armazenamento Seguro**: Criação do bucket de storage `member-photos` no Supabase com políticas de segurança apropriadas.
- **Sincronização no Backend**: Atualização da Deno Edge Function `api-members` para lidar com `avatar_url` no convite (`inviteMember`) e na atualização administrativa (`adminUpdateProfile`).
- **Renderização Visual**: Integração do `avatar_url` nos componentes `<Avatar>` na lista de gerenciamento de membros e na página de detalhes do perfil.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capabilidade de alto nível, estamos modificando uma existente. -->

### Modified Capabilities
- `member-management`: Adiciona requisitos para permitir o upload, salvamento e exibição de fotos de perfil (avatar) de membros tanto na criação/convite quanto na edição dos perfis pelo administrador.

## Impact

- **Frontend**: Componentes `NewMemberModal.tsx`, `MemberEditModal.tsx`, `MemberManagement.tsx`, `Profile.tsx` e o hook `useMembers.ts`.
- **Backend/Edge Function**: `supabase/functions/api-members/index.ts` (ações `inviteMember` e `adminUpdateProfile`).
- **Database/Storage**: Nova migração para criar o bucket `member-photos` e definir políticas de RLS de leitura pública e escrita restrita a administradores.
