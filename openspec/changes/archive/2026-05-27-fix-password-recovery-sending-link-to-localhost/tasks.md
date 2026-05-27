## 1. Configuração do Supabase Dashboard (pré-requisito)

- [x] 1.1 Acessar Supabase Dashboard → Authentication → Email Templates → Recovery e configurar o template: `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}`
- [x] 1.2 Acessar Supabase Dashboard → Authentication → URL Configuration e definir a `Site URL` como o domínio de produção (ex: `https://tekua.app` ou equivalente)
- [x] 1.3 Adicionar o domínio de produção à lista de "Redirect URLs" permitidas se necessário

## 2. Correção do ForgotPassword.tsx

- [x] 2.1 Remover o parâmetro `redirectTo` da chamada `supabase.auth.resetPasswordForEmail(email)` em `src/pages/ForgotPassword.tsx`

## 3. Correção do ResetPassword.tsx

- [x] 3.1 Atualizar a leitura de query params: substituir `params.get('email')` por `params.get('e')` e `params.get('token') || params.get('code')` por `params.get('t')` (removendo leitura de `#access_token` do hash)
- [x] 3.2 Atualizar a chamada `verifyOtp`: substituir `{ email, token, type: 'recovery' }` por `{ email, token_hash: tokenParam, type: 'recovery' }`
- [x] 3.3 Simplificar o fluxo pós-verificação: após `verifyOtp` bem-sucedido, o formulário de nova senha SHALL usar `supabase.auth.updateUser({ password })` diretamente (sem step adicional de OTP via `api-public`)

## 4. Verificação

- [x] 4.1 Testar o fluxo completo: solicitar recuperação → receber email → clicar link → verificar que abre no domínio correto com `?e=` e `?t=` → redefinir senha com sucesso
- [x] 4.2 Testar com token expirado/inválido: verificar que a mensagem de erro é exibida corretamente
