## Context

- `inviteMember` (`api-members`) já cria o usuário com `admin.createUser` (senha aleatória, `email_confirm: true`) e insere uma linha em `email_queue` sem `type` (default `invite`). O `cron_retry_emails` trata `invite` com `inviteUserByEmail`, que falha para usuário já existente — o e-mail nunca sai.
- `cron_retry_emails` já sabe enviar `type = 'external'` via Resend (`RESEND_API_KEY`).
- `/reset-password` (`ResetPassword.tsx`) já lê `?e=` e `?t=` (token_hash), chama `verifyOtp({ token_hash, type: 'recovery' })` e depois `updateUser({ password })`. É a página segura de configuração de senha; não precisa ser recriada.
- Não há `SITE_URL` configurado nas edge functions hoje.

## Goals / Non-Goals

**Goals:**
- Um único caminho de envio (gerar link + enviar) reutilizado pelo botão do admin e pelo cadastro.
- Link seguro, de uso único, para a página existente de configuração de senha.
- Falha de e-mail nunca derruba o cadastro; fica na fila.

**Non-Goals:**
- Reescrever o fluxo "Esqueci minha senha" (`ForgotPassword`).
- Novo painel de fila (já existe `EmailQueuePanel`).
- Corrigir configuração SMTP do Supabase Auth (infra).

## Decisions

**1. Gerar o link com `admin.generateLink({ type: 'recovery', email })` e montar a URL própria.**
Usamos `properties.hashed_token` para montar `${SITE_URL}/reset-password?e=<email>&t=<hashed_token>&flow=invite|reset`. Assim o e-mail não depende do SMTP/template do Supabase Auth e o link aponta direto para nossa página, que já faz `verifyOtp`. O `action_link` do Supabase não é usado (redireciona via domínio do Supabase e depende de `redirectTo` allowlist).
*Alternativas:* `inviteUserByEmail` (acopla criação e envio, falhou antes); `resetPasswordForEmail` (depende do SMTP do Auth e não permite enviar pelo Resend nem personalizar o conteúdo de convite).

**2. Enviar via Resend direto da edge function; em falha, enfileirar como `type = 'external'`.**
Reaproveita o canal já existente em `cron_retry_emails`. Helper em `_shared/password-email.ts` expõe `sendPasswordSetupEmail({ admin, email, flow })`, que gera o link, monta o HTML (pt-BR, com variação invite/reset), tenta o Resend e, se falhar, insere em `email_queue` com `subject/body/from_email`. Retorna `{ status: 'sent' | 'queued' }`.
*Trade-off:* o corpo enfileirado contém o link com token; a tabela já é só service-role (RLS sem políticas), e o token expira.

**3. Nova ação `sendPasswordSetupEmail` em `api-members`** com `{ targetUserId }`: checa admin, busca e-mail do perfil, chama o helper com `flow: 'reset'`. `inviteMember` chama o helper com `flow: 'invite'` no lugar do insert `invite` e devolve `emailStatus` na resposta para o frontend avisar quando ficou pendente.

**4. `ResetPassword.tsx` ganha modo `flow=invite`:** só muda título/subtítulo/botão (i18n), mantendo a mesma validação. O parâmetro `flow` não é de segurança; o token é o que autoriza. Após sucesso, encerra a sessão criada pelo `verifyOtp` (`signOut`) antes de ir ao login, para o usuário entrar explicitamente com a nova senha.

**5. Legado:** no `cron_retry_emails`, linhas `invite` passam a ser marcadas como `failed` com mensagem clara ou reconvertidas chamando o mesmo helper de link, em vez de `inviteUserByEmail`. Escolha: reenviar usando o helper (usuário que nunca recebeu finalmente recebe).

**6. Botão no `MemberManagement`:** ícone de e-mail/chave na coluna "Ações", `confirm` antes de enviar, estado de loading por linha, feedback via snackbar/alert existente. Chamada via `useMembers.sendPasswordSetupEmail` → `apiClient.invoke('api-members', 'sendPasswordSetupEmail', …)`.

## Risks / Trade-offs

- [Validade do token é global no Supabase Auth (padrão 1h) — curta para convite de novo membro] → Aumentar `Email OTP Expiration` no painel (ex.: 24h) e mencionar a validade no e-mail; admin pode reenviar a qualquer momento pelo botão.
- [`/forgot-password` documentado com 30 min de validade] → a mesma configuração global afeta os dois fluxos; registrar a decisão e alinhar o texto da spec antiga se mudar.
- [Admin spamma envios] → rate limit já existe em `api-members` (50/min); desabilitar botão durante o envio.
- [`SITE_URL` ausente ou errado gera link quebrado] → falhar explicitamente (erro 400) se não configurado, nunca usar o `Origin` da requisição.
- [Enumeração/abuso: link exposto em e-mail encaminhado] → token de uso único e com expiração; `signOut` após definir a senha.

## Migration Plan

1. Configurar secrets `RESEND_API_KEY` e `SITE_URL` nas edge functions e ajustar validade do OTP no Supabase.
2. Deploy de `api-members` e `cron_retry_emails`.
3. Deploy do frontend.
4. Opcional: rodar o cron para reenviar convites `invite` legados pendentes.
Rollback: reverter deploys; nenhuma migration de banco é necessária.
