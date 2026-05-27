## Context

O portal Tekuá utiliza o Supabase para a autenticação de usuários. No entanto, o fluxo de recuperação de senha precisa ser estendido com requisitos adicionais de segurança: validação obrigatória do e-mail da conta combinado ao token do Supabase na URL com expiração estrita de 30 minutos, exigência de um segundo fator de validação por código OTP enviado por e-mail no ato da redefinição e um alerta de segurança final após a conclusão da troca de senha.

## Goals / Non-Goals

**Goals:**
- Implementar o link "Esqueci minha senha" abaixo do botão de login na tela `/login`.
- Configurar o envio do link de recuperação contendo o e-mail da conta (`email`) e o token do Supabase (`token` ou `code`).
- Validar ambos na tela `/reset-password` no carregamento usando `supabase.auth.verifyOtp` ou lógica equivalente. Se for inválido ou tiver expirado (limite de 30 minutos), exibir a mensagem apropriada.
- Criar a tabela de banco de dados `password_reset_otps` para persistir e validar os OTPs de confirmação.
- Implementar ações públicas no Edge Function `api-public` (`sendResetPasswordOtp` e `confirmResetPasswordWithOtp`) para gerenciar a emissão, validação do OTP e atualização final da senha.
- Enviar alertas de segurança por e-mail via Resend nas etapas correspondentes (OTP e aviso de alteração de senha).

**Non-Goals:**
- Implementar troca de senha para usuários não registrados ou sem e-mail cadastrado.
- Implementar redefinição usando canais alternativos (SMS, WhatsApp, etc.).

## Decisions

### 1. Link de Recuperação Contendo E-mail e Token
Ao submeter o e-mail na página `/forgot-password`, chamaremos:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`,
});
```
O Supabase anexará o token/código de recuperação como hash (`#access_token=...`) ou parâmetro de consulta (`?code=...`). No frontend, extrairemos o e-mail e o token/código para realizar a validação inicial.

### 2. Validação Inicial na Tela `/reset-password`
No carregamento da tela, validaremos os dados chamando `verifyOtp`:
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token,
  type: 'recovery',
});
```
Se essa validação falhar (ou se o token/e-mail estiverem ausentes), a página exibirá a mensagem: **"A solicitação de troca de senha não existe ou expirou."** e impedirá a exibição do formulário de redefinição de senha. A validade de 30 minutos será garantida pela configuração de expiração padrão no Supabase (configurando o tempo de expiração do link para 1800 segundos / 30 minutos).

### 3. Segundo Fator de Confirmação por OTP
Ao invés de atualizar a senha diretamente no frontend via `supabase.auth.updateUser` no primeiro passo, faremos o seguinte:
- O usuário insere a nova senha e clica em redefinir.
- O frontend invoca o Edge Function `api-public` com a ação `sendResetPasswordOtp` passando o e-mail do usuário.
- O Edge Function gera um OTP numérico de 6 dígitos de uso único, salva-o no banco (tabela `password_reset_otps` com validade de 5-10 minutos) e envia por e-mail usando a API do Resend.
- O frontend exibe a tela para digitação do OTP.
- O usuário digita o OTP e clica em Confirmar.
- O frontend invoca a ação `confirmResetPasswordWithOtp` passando o e-mail, o OTP e a nova senha.
- O Edge Function valida o OTP. Se for válido, utiliza a conta administrativa (`supabaseAdmin.auth.admin.updateUserById`) para atualizar a senha do usuário.
- O Edge Function envia um e-mail de alerta avisando que a senha foi alterada e retorna sucesso.

### 4. Modelo de Dados para OTPs
Criaremos a tabela `password_reset_otps` na migração do banco:
```sql
CREATE TABLE public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Habilitar RLS e criar políticas de restrição se necessário (ou gerenciar apenas via service role no Edge Function)
ALTER TABLE public.password_reset_otps DISABLE ROW LEVEL SECURITY; -- Como é usado apenas pelo Edge Function administrativo, podemos desabilitar ou fazer bypass via service role.
```

## Risks / Trade-offs

- **Dependência do Resend**: O envio de e-mails depende da chave de API `RESEND_API_KEY` configurada no ambiente do Supabase.
  - *Mitigação*: Se `RESEND_API_KEY` estiver ausente no desenvolvimento local, registrar o OTP no console da Edge Function para fins de teste.
- **Configuração do Tempo de Expiração no Supabase**: O link enviado pelo Supabase depende da expiração do token de recuperação de senha configurado no console. Deve ser configurado para 1800 segundos (30 minutos) no Supabase.
