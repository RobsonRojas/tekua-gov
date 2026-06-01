## Why

Atualmente, ao remover a foto de perfil do usuário, a interface do usuário não reflete imediatamente a exclusão na visualização do Avatar e no botão de remoção de foto. O usuário precisa atualizar manualmente a página para ver a foto removida e o fallback (as iniciais do nome) renderizado corretamente.

## What Changes

- O Avatar do perfil do usuário na página `src/pages/Profile.tsx` passará a usar unicamente o estado local `photoPreview` no seu atributo `src`, permitindo atualização visual síncrona e instantânea tanto ao carregar/remover quanto ao alterar a foto.
- O botão "Remover Foto" dependerá diretamente do estado de visualização local reactivo `photoPreview` em vez do valor assíncrono obtido de `currentProfile?.avatar_url`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `user-profile`: Garantir que a remoção do avatar seja exibida instantaneamente de forma reativa na interface do usuário (sem recarregamento manual de página).

## Impact

- **Frontend**: Componente `src/pages/Profile.tsx` (interface com o Avatar e renderização do botão "Remover Foto" dependentes do estado local `photoPreview`).
