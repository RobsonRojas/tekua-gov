## 1. Novas Telas e Rotas

- [ ] 1.1 Criar a página `src/pages/ForgotPassword.tsx` com formulário de solicitação.
- [ ] 1.2 Criar a página `src/pages/ResetPassword.tsx` com formulário de nova senha.
- [ ] 1.3 Adicionar as rotas `/forgot-password` e `/reset-password` no arquivo `src/router.tsx`.

## 2. Integração com Autenticação

- [ ] 2.1 Implementar a função de solicitação de redefinição no `ForgotPassword.tsx` usando `supabase.auth.resetPasswordForEmail`.
- [ ] 2.2 Implementar a função de atualização de senha no `ResetPassword.tsx` usando `supabase.auth.updateUser`.
- [ ] 2.3 Ativar o link "Forgot Password" na tela `src/pages/Login.tsx`.

## 3. Experiência do Usuário (UX) e Traduções

- [ ] 3.1 Adicionar traduções para as novas telas nos arquivos `translation.json`.
- [ ] 3.2 Implementar feedback visual (Alerts/Toast) para sucesso e erro.
- [ ] 3.3 Validar força da senha e confirmação na tela de redefinição.
