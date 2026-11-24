## 1. Configuração do ambiente (manual)

- [x] 1.1 Definir `SITE_URL` (https, sem barra final) e `RESEND_API_KEY` (e `EMAIL_FROM`, se aplicável) via `npx supabase secrets set` no projeto `rhpcenqbelifilylwujy`
- [x] 1.2 Conferir com `npx supabase secrets list` que os secrets existem

## 2. Backend

- [x] 2.1 Criar `EmailConfigError` (code `EMAIL_NOT_CONFIGURED`) e validar `SITE_URL` (https; `localhost` permitido) em `supabase/functions/_shared/password-email.ts`, logando qual variável falta
- [x] 2.2 Em `supabase/functions/api-members/index.ts`, capturar `EmailConfigError` e responder 503 com `error: 'EMAIL_NOT_CONFIGURED'`; manter o comportamento atual para os demais erros
- [x] 2.3 Garantir que `cron_retry_emails` trate o mesmo erro sem quebrar o lote

## 3. Frontend

- [x] 3.1 Mapear `EMAIL_NOT_CONFIGURED` para a mensagem i18n `admin.sendPasswordEmailNotConfigured` (pt/en/es conforme locales existentes) em `AdminPanel.tsx`
- [x] 3.2 No cadastro de membro, exibir aviso quando `emailStatus === 'error'`

## 4. Testes e documentação

- [x] 4.1 Atualizar `src/lib/passwordEmail.test.ts` (erro tipado, `SITE_URL` inválida) e `src/pages/MemberManagement.test.tsx` (mensagem traduzida)
- [x] 4.2 Atualizar `SUPABASE_DEPLOYMENT_GUIDE.md` §4.1 com checklist de verificação
- [x] 4.3 Deploy de `api-members` e `cron_retry_emails`; testar o botão ponta a ponta e confirmar recebimento do e-mail e do link
