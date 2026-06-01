## Context

Atualmente, na página `src/pages/Profile.tsx`, a renderização do avatar e do botão "Remover Foto" depende do objeto de perfil síncrono/assíncrono `currentProfile?.avatar_url` recuperado da API e exposto via `useAuth()`.
Quando um usuário remove sua foto, a chamada da API do Edge Function remove com sucesso o avatar do banco de dados, mas como a atualização de volta para o cliente de autenticação (via assinatura do Supabase) possui um pequeno atraso (ou é inexistente em certos fluxos), a interface do usuário continua exibindo a foto antiga e o botão "Remover Foto" até que o usuário execute um recarregamento manual da página (`F5`).

## Goals / Non-Goals

**Goals:**
- Fazer com que o Avatar reflita instantaneamente a remoção de foto exibindo a inicial do nome como fallback.
- Fazer com que o botão "Remover Foto" desapareça síncrona e imediatamente logo após a confirmação da remoção.

**Non-Goals:**
- Não redesenharemos o fluxo de autenticação ou banco de dados.
- Não alteraremos outras guias de segurança, privacidade ou histórico de atividades do perfil.

## Decisions

- **Unificação dos Estados de Visualização no Frontend**:
  - Tanto a tag `<Avatar>` quanto a condicional de exibição do botão "Remover Foto" usarão o estado de reação imediato `photoPreview` em vez de consultarem `currentProfile?.avatar_url` diretamente na renderização.
  - Isso garante que a atualização desse estado (`setPhotoPreview(null)` na remoção e `setPhotoPreview(newUrl)` no upload) seja propagada de forma instantânea para a tela.

## Risks / Trade-offs

- **[Risco] Inconsistência Temporária**: Se a chamada à API falhar, o preview local pode ficar dessincronizado.
  - **Mitigação**: O estado `photoPreview` é atualizado na interface síncrona, mas com fallback robusto no bloco `catch` em caso de erro, redefinindo-o de volta ao valor original de `profile?.avatar_url`.
