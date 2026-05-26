## Context

O Supabase envia o email de recuperação usando um template configurável no dashboard. O template "Recovery" será definido como:

```
{{ .SiteURL }}reset-password/?e={{ .Email }}&t={{ .TokenHash }}
```

O `{{ .SiteURL }}` é a "Site URL" configurada no Supabase Auth → URL Configuration. O `{{ .TokenHash }}` é um hash único de uso único gerado pelo Supabase para validar a solicitação de recovery.

**Estado atual do `ResetPassword.tsx`:**
- Lê `?email=` (parâmetro antigo) e `?token=`/`?code=`/`#access_token=`
- Chama `verifyOtp({ email, token, type: 'recovery' })` com o campo `token` (que é para OTP de 6 dígitos)
- Após verificação, pede um OTP adicional via `api-public` Edge Function — fluxo redundante

**Novo estado:**
- Ler `?e=` (email) e `?t=` (token_hash) da URL
- Chamar `verifyOtp({ email, token_hash, type: 'recovery' })` — `token_hash` é o parâmetro correto para links de email do Supabase
- Após `verifyOtp` bem-sucedido, o Supabase cria sessão automaticamente, permitindo `supabase.auth.updateUser({ password })` diretamente

## Goals / Non-Goals

**Goals:**
- Corrigir a leitura de `?e=` e `?t=` no `ResetPassword.tsx`.
- Usar `token_hash` (não `token`) no `verifyOtp`.
- Remover `redirectTo` do `ForgotPassword.tsx` (delegando controle ao template do Supabase).
- Simplificar o fluxo: `verifyOtp` → `updateUser({ password })` diretamente, sem OTP adicional.
- Documentar configuração do template no Supabase Dashboard.

**Non-Goals:**
- Alterar o fluxo OTP customizado da `api-public` (que é usado pelo admin para reset manual — fluxo diferente).
- Criar novos componentes de UI — apenas ajustar a lógica do fluxo existente.

## Decisions

### Decision: `token_hash` via query param `?t=`

**Choice**: Usar `?t=` como parâmetro para `token_hash` seguindo o template `{{ .TokenHash }}`.

**Why**: O `token_hash` é o identificador correto para links de email do Supabase. O `token` (campo antigo) é para OTPs de 6 dígitos digitados pelo usuário — semanticamente diferente. A Supabase SDK distingue os dois campos em `verifyOtp`.

**Referência API**: `supabase.auth.verifyOtp({ email, token_hash, type: 'recovery' })`.

### Decision: Remover `redirectTo` do `ForgotPassword.tsx`

**Choice**: Chamar `resetPasswordForEmail(email)` sem `redirectTo`.

**Why**: O `redirectTo` é sobrescrito pelo template configurado no Supabase dashboard. Remover o `redirectTo` elimina a dependência de `window.location.origin` e garante que o template do dashboard seja sempre a fonte de verdade.

### Decision: Simplificar para `updateUser` após `verifyOtp`

**Choice**: Após `verifyOtp` bem-sucedido, usar `supabase.auth.updateUser({ password: newPassword })` para definir a senha.

**Why**: O `verifyOtp` com `token_hash` de recovery já cria uma sessão autenticada no Supabase. O fluxo OTP adicional via `api-public` era necessário antes porque a sessão não estava sendo criada corretamente.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `Site URL` no Supabase ainda apontando para localhost | Instruir explicitamente nas tasks — é pré-requisito para qualquer URL funcionar |
| Token hash expirado (1h de validade por padrão) | Comportamento padrão do Supabase — usuário recebe erro claro no `verifyOtp` |
| Fluxo OTP admin (`api-public`) não é afetado | Confirmado: `sendResetPasswordOtp` / `confirmResetPasswordWithOtp` são flows independentes no `api-public` |

## Migration Plan

1. Configurar o template "Recovery" no Supabase Dashboard.
2. Definir `Site URL` correta no Supabase Dashboard.
3. Atualizar `ForgotPassword.tsx` — remover `redirectTo`.
4. Atualizar `ResetPassword.tsx` — ler `?e=` e `?t=`, usar `token_hash` no `verifyOtp`, chamar `updateUser` após verificação.
5. Testar fluxo completo end-to-end.

**Rollback**: Reverter commits no `ForgotPassword.tsx` e `ResetPassword.tsx`.
