## 1. Frontend Profile Reactivity Improvements

- [x] 1.1 Atualizar `<Avatar>` em `src/pages/Profile.tsx` para usar unicamente o estado reativo `photoPreview` em vez do valor fallback `currentProfile?.avatar_url`.
- [x] 1.2 Atualizar a renderização condicional do botão "Remover Foto" em `src/pages/Profile.tsx` para depender de `photoPreview` em vez de `currentProfile?.avatar_url`.

## 2. Verification & Build

- [x] 2.1 Testar manualmente a remoção de foto de perfil e verificar se ela desaparece e exibe o fallback instantaneamente sem recarregar a página.
- [x] 2.2 Garantir compilação de produção limpa executando `npm run build`.
