## Context

Ver proposal.md - Why. Causa raiz confirmada no código: `supabase/functions/_shared/password-email.ts` lança `SITE_URL is not configured` antes de `auth.admin.generateLink`, e o `catch` global de `api-members` converte qualquer exceção em HTTP 400 com `error.message`. Logs de Auth vazios são consistentes com isso (o Auth nunca é chamado). O guia de deploy (§4.1) já documenta o secret, mas ele não foi aplicado no projeto.

## Goals / Non-Goals

**Goals:**
- Destravar o envio (secrets configurados) e verificar ponta a ponta.
- Falhas de configuração distinguíveis de erros do usuário e legíveis para o admin.

**Non-Goals:**
- Não derivar `SITE_URL` do header `Origin` (decisão de segurança já registrada: evita link de reset apontando para host controlado pelo atacante).
- Não trocar Resend por SMTP do Supabase Auth.

## Decisions

- **Erro tipado `EmailConfigError` com `code = 'EMAIL_NOT_CONFIGURED'`** em `password-email.ts`, em vez de comparar strings de mensagem. `api-members` o captura e responde `{ data: null, error: 'EMAIL_NOT_CONFIGURED', code: ... }` com status 503. Alternativa (manter 400 + string) rejeitada: frágil e mascara problema de servidor como erro de cliente.
- **Validação de `SITE_URL`**: `new URL()` com protocolo `https:` (permitir `http://localhost` apenas se o hostname for `localhost`, para dev). Barra final já é removida em `buildSetupUrl`.
- **Tradução no frontend**: `useMembers.sendPasswordSetupEmail` devolve `error` com o código; `AdminPanel` mapeia `EMAIL_NOT_CONFIGURED` para chave i18n `admin.sendPasswordEmailNotConfigured`. Alternativa (mensagem pronta no backend) rejeitada: backend não conhece o idioma da UI.
- **Cadastro**: `inviteMember` já devolve `emailStatus`; o front passa a tratar `'error'` com aviso explícito (hoje só `queued`).
- **Secrets**: ação manual via `npx supabase secrets set` + redeploy; não automatizável pelo código.

## Risks / Trade-offs

- [Status 503 em vez de 400 pode afetar tratamento no `ApiClient`] → verificar que o client trata `!ok` genericamente (já loga e lança); cobrir em teste.
- [Secret definido com valor errado (ex.: barra final, http)] → validação + testes; guia com checklist.
- [`RESEND_API_KEY` também pode estar ausente] → mesmo caminho de erro tipado; o checklist verifica ambos.
- [Domínio do `EMAIL_FROM` não verificado no Resend → envio cai na fila] → já tratado pelo fallback `email_queue`; mencionar no guia.

## Migration Plan

1. Definir `SITE_URL`, `RESEND_API_KEY` (e `EMAIL_FROM` se necessário) nos secrets do projeto.
2. Deploy de `api-members` e `cron_retry_emails`.
3. Testar o botão com um usuário real e conferir o recebimento e o link `/reset-password`.
Rollback: reverter o deploy das funções; os secrets podem permanecer.
