## Why

O botão "Enviar e-mail de troca de senha" (Gerenciamento de Usuários) não envia nada: a edge function `api-members` responde `400 {"error":"SITE_URL is not configured"}`. O secret `SITE_URL` nunca foi definido no projeto Supabase (`rhpcenqbelifilylwujy`), então o helper `sendPasswordSetupEmail` aborta antes de chamar o Auth/Resend — por isso os logs de Auth estão vazios. O mesmo vale para o e-mail de finalização de cadastro de novos membros (que falha silenciosamente em `emailStatus: 'error'`). Além disso, o administrador vê a mensagem técnica crua em inglês, sem saber que é um problema de configuração.

## What Changes

- Configurar (operacional) os secrets `SITE_URL` e `RESEND_API_KEY` (e opcionalmente `EMAIL_FROM`) no projeto Supabase e fazer redeploy de `api-members` e `cron_retry_emails`.
- Tornar a falha de configuração explícita e diagnosticável: a função passa a retornar um código de erro estável (`EMAIL_NOT_CONFIGURED`) e status 5xx (não 400) quando faltar `SITE_URL`/`RESEND_API_KEY`, registrando no log qual variável falta (sem expor valores).
- O painel admin traduz esse código para uma mensagem clara em português ("Envio de e-mail não configurado no servidor. Contate o responsável técnico.") em vez de exibir o erro bruto.
- Cadastro de novo membro: quando `emailStatus` for `error`, o administrador é avisado de que o e-mail não foi enviado nem enfileirado (hoje o aviso depende apenas de `queued`).
- Validar `SITE_URL` (URL https absoluta) para evitar links malformados.
- Atualizar `SUPABASE_DEPLOYMENT_GUIDE.md` com checklist de verificação pós-configuração.

## Capabilities

### New Capabilities

### Modified Capabilities
- `member-password-emails`: acrescenta requisito de comportamento quando o envio de e-mail não está configurado no servidor (erro explícito e compreensível ao administrador, sem bloquear o cadastro).

## Impact

- `supabase/functions/_shared/password-email.ts` (validação e erro tipado)
- `supabase/functions/api-members/index.ts` (mapeamento de erro/status nos casos `sendPasswordSetupEmail` e `inviteMember`)
- `src/hooks/useMembers.ts`, `src/pages/AdminPanel.tsx`, i18n (mensagens)
- `src/lib/passwordEmail.test.ts`, `src/pages/MemberManagement.test.tsx`
- `SUPABASE_DEPLOYMENT_GUIDE.md`
- Infra: secrets do Supabase (ação manual do responsável; não pode ser feita só por código)
