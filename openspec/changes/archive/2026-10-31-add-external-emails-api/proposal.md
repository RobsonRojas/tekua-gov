## Why

Sistemas externos (sites, formulários de contato, integrações) precisam fazer a plataforma enviar um e-mail para `contato@tekua.com.br` sem depender de uma sessão Supabase nem expor a `SUPABASE_SERVICE_ROLE_KEY`. Hoje não existe nenhum endpoint dedicado para isso: o envio é feito inline por funções internas (`notify-engine`) ou por convites do Auth, todos inacessíveis com segurança a terceiros.

## What Changes

- Nova Edge Function dedicada `api-external-emails`, com `verify_jwt = false` (chamável por sistemas externos, sem JWT Supabase) e autorização por **token secreto único** em variável de ambiente (`EXTERNAL_EMAILS_TOKEN`), comparado em tempo constante.
- Limites rígidos de envio: o **destinatário** e o **remetente** são fixos em `contato@tekua.com.br`; o chamador fornece apenas `subject` e `body` (opcionalmente `replyTo`). Isso impede uso do endpoint como relay aberto.
- Enfileiramento em `email_queue` (não envio síncrono direto): a função valida, grava a linha e dispara o processamento; a entrega efetiva fica a cargo do cron de retry.
- Extensão aditiva de `email_queue` (`type`, `subject`, `body`, `from_email`, `updated_at`) para suportar e-mails genéricos sem quebrar o fluxo de convites existente. Inclui a criação de `updated_at`, hoje ausente (o cron de retry já a atualiza).
- `cron_retry_emails` passa a ramificar por `type`: `external` → envio via Resend (`RESEND_API_KEY`); demais → comportamento atual de convite.
- Rate limiting por IP e validação de tamanho de payload.
- Painel administrativo `EmailQueuePanel` passa a indicar o tipo/assunto das linhas da fila.
- Tutorial de integração para aplicações externas em `docs/api-external-emails.md`, cobrindo autenticação por token, contrato de requisição/resposta, códigos de erro e exemplos (curl/JS/Python).
- Script de teste via `curl` em `supabase/functions/api-external-emails/test_curl.sh`, exercitando os casos de sucesso e de falha (401/400/429/202) contra ambiente local ou de produção.

## Capabilities

### New Capabilities

- `external-email-api`: endpoint dedicado e autenticado por token secreto para que sistemas externos solicitem o envio de e-mails transacionais para `contato@tekua.com.br`, com enfileiramento resiliente (via `email_queue` + retry) e limites rígidos de remetente/destinatário.

### Modified Capabilities

<!-- Nenhuma: o comportamento de fila/retry de e-mails não é coberto por specs existentes; ele é introduzido por esta nova capability. -->

## Impact

- **Edge Functions:** nova `supabase/functions/api-external-emails/` (+ `deno.json`); alteração em `supabase/functions/cron_retry_emails/index.ts`.
- **Configuração:** novo bloco `[functions.api-external-emails]` em `supabase/config.toml` com `verify_jwt = false`; novos segredos: `EXTERNAL_EMAILS_TOKEN` (obrigatório) e reuso de `RESEND_API_KEY`.
- **Banco (migração nova):** colunas aditivas em `email_queue` (`type`, `subject`, `body`, `from_email`, `updated_at`); sem alteração destrutiva.
- **Frontend:** `src/components/admin/EmailQueuePanel.tsx` (exibição de tipo/assunto).
- **Documentação/Testes:** novo tutorial `docs/api-external-emails.md` e script de teste `supabase/functions/api-external-emails/test_curl.sh` (via `curl`).
- **Segurança:** introduz endpoint público autenticado por segredo; exige rate limiting, comparação em tempo constante e limites de payload.
- **Dependências externas:** Resend (domínio remetente `tekua.com.br` precisa estar verificado na conta Resend).
