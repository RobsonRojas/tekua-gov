## Why

O fluxo de recuperação de senha usa `supabase.auth.resetPasswordForEmail()` com `redirectTo: window.location.origin`, que em desenvolvimento aponta para `localhost:5173`. O template de email do Supabase será configurado para usar `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}`, mas o `ResetPassword.tsx` ainda lê os parâmetros com chaves antigas (`?email=`, `?token=`, `#access_token=`) e não valida o `token_hash` corretamente. O resultado é um link quebrado que redireciona para localhost e não completa a redefinição de senha.

## What Changes

- **Supabase email template**: configurar o template de "Recovery" para usar `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}`.
- **`ResetPassword.tsx`**: atualizar a leitura de query params de `?email=`→`?e=` e `?token=`/`#access_token=`→`?t=` (token_hash); ajustar a chamada a `supabase.auth.verifyOtp()` para usar `token_hash` em vez de `token`.
- **`ForgotPassword.tsx`**: remover `redirectTo` da chamada `resetPasswordForEmail` — o redirecionamento passa a ser controlado pelo template no dashboard Supabase (`{{ .SiteURL }}`), que usa a `Site URL` configurada.
- **Supabase Dashboard**: garantir que a `Site URL` aponte para o domínio de produção.

## Capabilities

### New Capabilities
- (nenhuma nova capability — é correção de bug em capability existente)

### Modified Capabilities
- `forgot-password`: O fluxo de recuperação passa a usar o template nativo do Supabase com `{{ .SiteURL }}` e `{{ .TokenHash }}`, eliminando a dependência de `window.location.origin`. O `ResetPassword.tsx` valida tanto o email (`?e=`) quanto o token hash (`?t=`) recebidos na URL.

## Impact

- **Frontend**: `src/pages/ResetPassword.tsx` — leitura dos params `?e=` e `?t=` + `verifyOtp` com `token_hash`.
- **Frontend**: `src/pages/ForgotPassword.tsx` — remoção do `redirectTo` da chamada `resetPasswordForEmail`.
- **Supabase Dashboard**: configuração do template de email "Recovery" com `{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}` e definição da `Site URL` correta.
- **Sem mudanças de banco de dados** — nenhuma migration necessária.
