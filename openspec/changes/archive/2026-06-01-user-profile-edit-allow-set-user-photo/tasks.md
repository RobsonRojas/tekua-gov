## 1. Database & Storage Policies

- [x] 1.1 Criar uma nova migração SQL para adicionar a política RLS `member-photos-owner` no Supabase, permitindo que usuários autenticados gerenciem seus próprios arquivos (com política de `owner = auth.uid()`).

## 2. Frontend Profile Integration

- [x] 2.1 Atualizar `src/pages/Profile.tsx` para importar `uploadFile` e `getFileUrl` de `src/utils/storage.ts` e ícones necessários do `lucide-react`.
- [x] 2.2 Adicionar states no componente `Profile` em `src/pages/Profile.tsx` para controlar carregamento, erro temporário de upload, previews reativos e referências de upload.
- [x] 2.3 Implementar o botão de interação (câmera flutuante) e input oculto sobre o `<Avatar>` na página de perfil, renderizando esta interface somente se o usuário autenticado for o proprietário do perfil (`user.id === currentProfile.id`).
- [x] 2.4 Implementar a função `handlePhotoChange` para compactar automaticamente e fazer upload da nova imagem para o bucket `member-photos`, salvando o resultado chamando a ação `updateProfile` da API de membros.
- [x] 2.5 Implementar a ação de exclusão/remoção do avatar atual (definindo a foto para `null` no banco de dados) com fallback para as iniciais do nome na interface do usuário.

## 3. Verification & Build

- [x] 3.1 Validar manualmente os fluxos completos de upload, atualização e remoção de fotos de perfil de usuário.
- [x] 3.2 Garantir que a compilação de produção do projeto continue funcionando sem erros executando `npm run build`.
