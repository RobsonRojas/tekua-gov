## 1. Preparation

- [x] 1.1 Importar `useTheme` e `useMediaQuery` no `AdminPanel.tsx`
- [x] 1.2 Definir a constante `ADMIN_TABS` com ícones, rótulos e slugs de URL
- [x] 1.3 Adicionar estado de controle para o menu mobile (`anchorEl`)

## 2. Admin Panel UI Refactoring

- [x] 2.1 Envolver o componente `Tabs` administrativo em uma condicional responsiva
- [x] 2.2 Implementar o botão de seletor mobile que exibe a ferramenta ativa
- [x] 2.3 Implementar o componente `Menu` administrativo e seus `MenuItem`s
- [x] 2.4 Vincular a seleção do menu à atualização dos `searchParams` e fechar o menu

## 3. Verification

- [x] 3.1 Validar se a navegação por abas continua funcional no Desktop
- [x] 3.2 Testar a troca de ferramentas via menu mobile e verificar se a URL é atualizada corretamente
- [x] 3.3 Confirmar que o deep linking (acessar via `/admin-panel?tab=docs`) continua funcionando em ambos os modos
