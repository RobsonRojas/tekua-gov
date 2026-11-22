## Why

Hoje o administrador não tem como disparar uma troca de senha para um membro (só pode definir a senha manualmente na aba de segurança), e o cadastro de um membro novo não entrega ao usuário nenhum caminho funcional para ativar a conta: o `inviteMember` cria o usuário com senha aleatória descartada e enfileira em `email_queue` uma linha do tipo `invite`, que o `cron_retry_emails` tenta enviar com `inviteUserByEmail` — o que falha porque o usuário já existe. Resultado: o membro nunca recebe o e-mail e não consegue definir a própria senha.

## What Changes

- Novo botão **"Enviar e-mail de troca de senha"** no painel de gerenciamento de membros do admin (por usuário), com confirmação e feedback de sucesso/erro.
- Nova ação `sendPasswordSetupEmail` na edge function `api-members` (somente admin), que gera um link de recuperação e envia o e-mail ao usuário.
- No `inviteMember`, após criar o usuário, enviar automaticamente um e-mail de boas-vindas para **finalizar o cadastro e definir a senha**, em vez do registro `invite` que nunca é entregue.
- O link do e-mail aponta para a página segura `/reset-password` do próprio app (token de uso único, validado via `verifyOtp`, sem expor senha), com textos específicos de "finalizar cadastro" quando o fluxo for de convite.
- Envio via Resend (já usado em `cron_retry_emails`), com fallback para `email_queue` (`type = 'external'`) quando o envio imediato falhar.
- Ajustar o `cron_retry_emails` para não tentar mais `inviteUserByEmail` em linhas legadas `invite` de usuários já existentes.

## Capabilities

### New Capabilities
- `member-password-emails`: envio de e-mails de definição/troca de senha (por ação do admin e no cadastro de novo membro) e página segura de configuração de senha acessada pelo link.

### Modified Capabilities
- `member-management`: o cadastro de novo membro passa a enviar e-mail de finalização de cadastro; o painel de membros ganha a ação de enviar e-mail de troca de senha.

## Impact

- `supabase/functions/api-members/index.ts` (nova ação, alteração de `inviteMember`)
- `supabase/functions/cron_retry_emails/index.ts` (tratar linhas `invite` legadas)
- `supabase/functions/_shared/` (helper de geração de link + template de e-mail)
- `src/pages/MemberManagement.tsx`, `src/hooks/useMembers.ts` (botão e chamada)
- `src/pages/ResetPassword.tsx` (modo "finalizar cadastro", textos i18n)
- Secrets das edge functions: `RESEND_API_KEY`, `SITE_URL` (URL pública do app)
- Configuração do Supabase Auth: validade do token de recuperação (ação manual no painel)
