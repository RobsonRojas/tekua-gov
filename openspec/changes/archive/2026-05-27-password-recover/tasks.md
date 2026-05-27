## 1. Banco de Dados e Infraestrutura

- [x] 1.1 Criar a migração `supabase/migrations/20260525000000_create_password_reset_otps.sql` para criar a tabela `password_reset_otps`.

## 2. Ações do Edge Function (Backend)

- [x] 2.1 Adicionar a ação `sendResetPasswordOtp` no Edge Function `api-public` para gerar, persistir no banco de dados e enviar o código OTP por e-mail via Resend.
- [x] 2.2 Adicionar a ação `confirmResetPasswordWithOtp` no Edge Function `api-public` para validar o OTP, atualizar a senha do usuário usando o cliente administrativo e enviar o e-mail de alerta final de alteração de senha.

## 3. Telas e Lógica de Frontend

- [x] 3.1 Atualizar `src/pages/ForgotPassword.tsx` para passar o e-mail da conta como parâmetro `email` na URL de redirecionamento `redirectTo`.
- [x] 3.2 Atualizar `src/pages/ResetPassword.tsx` para validar o e-mail e o token Supabase da URL no carregamento do componente utilizando `supabase.auth.verifyOtp`, exibindo erro apropriado se inválido ou expirado.
- [x] 3.3 Implementar em `src/pages/ResetPassword.tsx` a lógica de submissão do formulário de nova senha que solicita o OTP, exibe o input de OTP e finaliza a troca via Edge Function.
- [x] 3.4 Configurar chaves de tradução adicionais nos arquivos `src/locales/pt/translation.json` e `src/locales/en/translation.json` para suportar todas as mensagens de erro/sucesso do novo fluxo de recuperação.

## 4. Testes e Validação

- [x] 4.1 Criar testes de unidade ou de integração (Vitest/Playwright) cobrindo a validação de token, fluxo de OTP e atualização da senha.
- [x] 4.2 Rodar os testes automatizados e o processo de build do projeto para garantir conformidade e estabilidade.
