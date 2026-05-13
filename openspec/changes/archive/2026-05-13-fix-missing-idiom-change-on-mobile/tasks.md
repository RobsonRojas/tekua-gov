## 1. UI Implementation

- [x] 1.1 Localizar o container do `LanguageSelector` no final de `src/components/Navigation/MobileDrawer.tsx`
- [x] 1.2 Mover o seletor de idioma para uma posição acima do botão de Logout ou dentro da última `List` de utilitários
- [x] 1.3 Remover o `Box` com `mt: 'auto'` que causa o problema de visibilidade se a tela for pequena

## 2. Verification

- [x] 2.1 Verificar se o seletor de idioma aparece corretamente no menu mobile (Drawer)
- [x] 2.2 Testar a visibilidade em resoluções pequenas (ex: iPhone SE, 320px de largura)
- [x] 2.3 Confirmar que o botão de troca de idioma continua funcional após o reposicionamento
