## Why

Atualmente, o sistema de gerenciamento de membros permite que administradores alterem fotos de perfil de membros através dos modais de gerenciamento administrativo, mas os próprios usuários não possuem a capacidade de trocar e gerenciar suas próprias fotos de perfil diretamente na página de perfil do usuário. Permitir que os usuários gerenciem suas fotos promove maior autonomia e personalização da plataforma.

## What Changes

- Adição de um controle interativo de câmera no avatar do usuário na página de perfil (`src/pages/Profile.tsx`) quando estiver em modo de visualização do próprio perfil.
- Implementação de um fluxo de upload direto do frontend para o bucket de storage `member-photos`, utilizando compressão de imagens integrada para otimização de largura de banda e espaço em disco (máx. 5MB).
- Suporte para visualização reativa instantânea (preview) no frontend antes e durante a persistência.
- Chamada para persistir a nova `avatar_url` na tabela `profiles` através da Edge Function `updateProfile`.
- Ação para remover a foto atual do perfil diretamente pela página do perfil.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `user-profile`: Adição do cenário de alteração e remoção da foto de perfil diretamente pelo próprio usuário autenticado na página de perfil.

## Impact

- **Frontend**: Componente `src/pages/Profile.tsx` (interface com botão de edição de avatar, input do tipo arquivo oculto, visualizações de carregamento/sucesso/erro e exclusão).
- **Backend/Storage**: Bucket `member-photos` (via RLS e cliente Supabase). O próprio usuário autenticado precisa de permissão de escrita/exclusão em seu próprio arquivo de avatar.
- **Banco de Dados/RLS**: Verificação de políticas do bucket para garantir que `auth.uid() = id_do_usuario` ou administradores possam gerenciar fotos na pasta apropriada.
