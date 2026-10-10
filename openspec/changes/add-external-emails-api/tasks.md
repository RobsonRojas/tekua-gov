## 1. Banco de dados (migração)

- [x] 1.1 Criar migração que adiciona colunas a `email_queue`: `type text NOT NULL DEFAULT 'invite'`, `subject text`, `body text`, `from_email text`, `reply_to text`, `updated_at timestamptz DEFAULT now()` (registros existentes ficam `type = 'invite'`).
- [x] 1.2 Confirmar que a migração é aditiva e não altera políticas/RLS existentes de `email_queue`.

## 2. Edge Function api-external-emails

- [x] 2.1 Criar `supabase/functions/api-external-emails/index.ts` com `serve`, headers CORS e tratamento de `OPTIONS`.
- [x] 2.2 Implementar autorização por token secreto: ler `EXTERNAL_EMAILS_TOKEN`, aceitar `x-api-token` (e `Authorization: Bearer` como fallback), comparar em tempo constante; falha fechada se ausente; responder 401 genérico sem registrar o token.
- [x] 2.3 Validar entrada: `subject` obrigatório (≤ 200 chars), `body` obrigatório (≤ 20.000 chars), `replyTo` opcional válido; responder 400 em erro; **ignorar** `to`/`from` enviados pelo chamador.
- [x] 2.4 Aplicar rate limiting por IP via `checkRateLimit` (chave `api:external-emails:<ip>`) e responder 429 no excesso.
- [x] 2.5 Enfileirar em `email_queue` com `type = 'external'`, `email = 'contato@tekua.com.br'`, `from_email = 'contato@tekua.com.br'`, `subject`, `body`, `status = 'pending'`; responder 202 com o `id`; disparar best-effort o `cron_retry_emails` para entrega imediata.
- [x] 2.6 Criar `supabase/functions/api-external-emails/deno.json` (import map) e declarar `[functions.api-external-emails]` em `supabase/config.toml` com `verify_jwt = false`.

## 3. Processador de fila (cron_retry_emails)

- [x] 3.1 Selecionar `type` e ramificar: `external` → envio via Resend (`POST https://api.resend.com/emails`) usando `from_email`, `email`, `subject`, `body` e `reply_to` (quando houver); demais → manter `inviteUserByEmail` atual.
- [x] 3.2 Isolar falhas por item: atualizar `status`/`error_message`/`updated_at` em ambos os casos sem interromper o processamento dos demais.
- [x] 3.3 Definir as constantes de remetente/destinatário `contato@tekua.com.br` e usar `RESEND_API_KEY` para os envios externos.

## 4. Frontend (painel da fila)

- [x] 4.1 `src/components/admin/EmailQueuePanel.tsx`: exibir as colunas **Tipo** e **Assunto** (com fallback "convite" quando `type` ausente/`invite`).

## 5. Documentação e script de teste

- [x] 5.1 Criar `docs/api-external-emails.md` (tutorial de integração para aplicações externas): visão geral, URL do endpoint (local e produção), autenticação com token no header `x-api-token`, payload (`subject`/`body`/`replyTo`), exemplos de requisição (curl/JS/Python), tabela de respostas (202/400/401/429), limites de tamanho/rate, nota de que remetente e destinatário são fixos em `contato@tekua.com.br` e como rotacionar o token.
- [x] 5.2 Criar `supabase/functions/api-external-emails/test_curl.sh` (executável, seguindo `cora-payment/test_cora.sh`): URL e token via variáveis de ambiente (default local); casos de token ausente (401), token inválido (401), payload inválido (400) e sucesso (202); incluir exemplo que envia `to`/`from` falsos para demonstrar que são ignorados, com os comandos de verificação impressos.
- [x] 5.3 Documentar no tutorial (ou no cabeçalho do script) como executar localmente (`supabase functions serve` + segredo) e contra produção.

## 6. Verificação

- [ ] 6.1 Executar `supabase/functions/api-external-emails/test_curl.sh` localmente e confirmar os códigos esperados (401/400/202) e o registro `pending` na fila.
- [ ] 6.2 Confirmar que campos `to`/`from` enviados pelo chamador são ignorados e o registro usa `contato@tekua.com.br` como remetente e destinatário.
- [x] 6.3 Checagem de sintaxe dos arquivos TS das funções (via `node` + `ts.transpileModule`, pois Deno não está instalado).
- [x] 6.4 Validar a sintaxe do script com `bash -n supabase/functions/api-external-emails/test_curl.sh`.
- [x] 6.5 Rodar `npm run build` e a suíte de testes; confirmar que não há regressões novas.
- [x] 6.6 Rodar `openspec validate add-external-emails-api` e confirmar 0 issues.
