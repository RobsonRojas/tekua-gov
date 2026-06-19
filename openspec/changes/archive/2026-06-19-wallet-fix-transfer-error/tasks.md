## 1. Fix DOM Nesting

- [x] 1.1 Em `src/pages/Wallet.tsx`, substituir os React Fragments (`<>...</>`) no `startAdornment` e `endAdornment` dentro de `renderInput` do `<Autocomplete>` por `<InputAdornment>`.
- [x] 1.2 Alterar o `<Typography variant="h3">` dentro de `<DialogTitle>` do modal de transferência para `<Typography variant="h3" component="span">`.
- [x] 1.3 Remover a propriedade HTML inválida `scroll-behavior="smooth"` no componente `<Button>` de confirmação de transferência.

## 2. Validation

- [x] 2.1 Abrir a página da carteira e clicar no botão "Transferir" para garantir que o modal abre corretamente sem disparar o erro de 'insertBefore'.
