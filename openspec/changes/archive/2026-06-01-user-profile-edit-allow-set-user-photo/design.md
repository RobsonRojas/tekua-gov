## Context

A implementação anterior habilitou o gerenciamento de fotos de perfil de membros apenas por administradores do sistema. Agora, precisamos estender essa funcionalidade para permitir que qualquer usuário autenticado gerencie seu próprio avatar diretamente em sua página de perfil.

## Goals / Non-Goals

**Goals:**
- Habilitar botão/interação de câmera no componente `<Avatar>` da página `Profile.tsx` apenas para o próprio usuário visualizando seu perfil.
- Realizar a compactação e o upload da imagem selecionada para o bucket `member-photos` usando o utilitário `uploadFile`.
- Persistir a nova URL da imagem chamada `avatar_url` na tabela `profiles` do usuário chamando o backend.
- Permitir a remoção completa da foto com atualização do estado no banco de dados para `null`.
- Adicionar política RLS no Supabase para garantir que o usuário autenticado consiga fazer upload e excluir seu próprio arquivo no bucket `member-photos`.

**Non-Goals:**
- Permitir que membros comuns editem fotos de outros membros (isso permanece restrito a administradores).
- Modificar o fluxo de cadastro e convite básico de membros.

## Decisions

### 1. Interação Direta no Avatar da Página de Perfil
Em vez de abrir um modal de edição complexo apenas para o avatar, adicionaremos um botão interativo de câmera flutuante sobre o avatar do perfil em `Profile.tsx` (quando o perfil sendo visualizado pertencer ao usuário logado: `user.id === currentProfile.id`). Ao clicar, abre o seletor nativo do sistema operacional.

### 2. Atualização das Políticas RLS no Supabase Storage
Para viabilizar o upload direto feito pelo usuário comum, adicionaremos uma nova política RLS no bucket `member-photos` permitindo que usuários autenticados realizem todas as operações (`FOR ALL`) nos seus próprios arquivos (`owner = auth.uid()`).
```sql
CREATE POLICY "member-photos-owner" ON storage.objects
FOR ALL USING (
    bucket_id = 'member-photos' 
    AND auth.uid() = owner
);
```

### 3. Chamada da API de Atualização de Perfil
Usaremos a ação existente `updateProfile` da Edge Function `api-members` que permite que qualquer usuário atualize campos de seu próprio perfil (campos não protegidos).
A propriedade `avatar_url` não está na lista de campos protegidos (`roles`, `id`, `created_at`, etc.) em `updateProfile`, então o frontend pode passá-la diretamente:
```typescript
const { data, error } = await apiClient.invoke('api-members', 'updateProfile', {
  updates: { avatar_url: newAvatarUrl }
});
```

## Risks / Trade-offs

- **[Risk]** Upload excessivo ou órfão de imagens ao trocar de foto repetidamente.
  - *Mitigação*: Compressão prévia integrada para minimizar o tamanho (< 1MB) e políticas RLS restritas para impedir abusos. Futuramente, pode-se implementar um trigger de limpeza para apagar fotos antigas do storage ao atualizar.
