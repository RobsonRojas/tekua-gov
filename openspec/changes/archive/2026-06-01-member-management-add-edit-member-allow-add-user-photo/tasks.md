## 1. Storage & Database Setup

- [x] 1.1 Criar uma migração do Supabase para inicializar o bucket `member-photos` com limite de 5MB e formatos JPEG, PNG e WEBP permitidos.
- [x] 1.2 Configurar as políticas de RLS na migração para permitir a leitura pública do bucket `member-photos` e escrita (Insert/Update/Delete) apenas para administradores.

## 2. Backend Deno Edge Function

- [x] 2.1 Atualizar a ação `inviteMember` na Edge Function `supabase/functions/api-members/index.ts` para receber `avatar_url` dos parâmetros e inseri-la no metadado `data` do convite.

## 3. Frontend & Storage Integration

- [x] 3.1 Atualizar `src/utils/storage.ts` para incluir `'member-photos'` nos buckets permitidos do tipo `UploadOptions`.
- [x] 3.2 Atualizar o hook `src/hooks/useMembers.ts` para permitir o envio do parâmetro `avatarUrl` no convite `inviteMember`.
- [x] 3.3 Atualizar o componente `<Avatar>` em `src/pages/MemberManagement.tsx` para passar a propriedade `src={member.avatar_url}`, habilitando a exibição da foto na lista administrativa.
- [x] 3.4 Atualizar o componente `<Avatar>` em `src/pages/Profile.tsx` para passar a propriedade `src={currentProfile?.avatar_url}`, habilitando a exibição da foto na página de perfil.

## 4. Modais de Novo Membro & Edição

- [x] 4.1 Implementar campo de upload e preview visual com compactação de imagem no componente `src/components/admin/NewMemberModal.tsx`, enviando a foto para o bucket `member-photos` durante a submissão do convite.
- [x] 4.2 Implementar campo de upload, preview, alteração e remoção de imagem de perfil com compactação no componente `src/components/admin/MemberEditModal.tsx`, enviando a foto e propagando a nova `avatar_url` para o backend no salvamento.

## 5. Verification & Tests

- [x] 5.1 Validar manualmente os fluxos completos de convite de novo membro com foto e edição de membro com alteração/remoção da foto.
- [x] 5.2 Garantir que a build de produção compila com sucesso rodando `npm run build`.
