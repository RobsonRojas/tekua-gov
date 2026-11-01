## Context

Ver `proposal.md` — Why. Estado atual relevante:

- E-mails são enviados via Resend (`RESEND_API_KEY`) inline em funções internas (`notify-engine`, `cron-rewards-notify`), sempre a partir de `alertas@tekua.org`.
- Existe a tabela `email_queue (id, email, status, error_message, created_at)` usada pelo convite de membros (`api-members` insere `pending`) e reprocessada por `cron_retry_emails`, que hoje só executa `auth.admin.inviteUserByEmail(item.email)`.
- `cron_retry_emails` já atualiza `updated_at`, coluna que **não existe** na migração da tabela (bug latente).
- `src/components/admin/EmailQueuePanel.tsx` lista e reprocessa a fila manualmente.
- Padrões de autenticação existentes em Edge Functions: JWT (api-*), público por IP (`api-public`), e segredo compartilhado via `Bearer` (`cron-rewards-notify` → `CRON_SECRET`). `config.toml` declara `verify_jwt` por função e `import_map` opcional.

## Goals / Non-Goals

**Goals:**
- Expor um endpoint externo autenticado por token secreto único, com remetente e destinatário fixos.
- Enfileirar e entregar de forma resiliente reaproveitando a infraestrutura de fila/retry.
- Não introduzir risco de relay aberto nem quebrar o fluxo de convites existente.
- Fornecer documentação de integração e meios de teste (`curl`) que permitam a uma aplicação externa integrar sem ler o código da função.

**Non-Goals:**
- Múltiplos tokens/API keys por cliente, revogação individual ou gestão via UI.
- Envio para destinatários arbitrários, anexos, listas de destinatários (CC/BCC) ou templates ricos.
- Substituir o `notify-engine` ou unificar todo o envio de e-mails da plataforma.

## Decisions

**1. Autenticação por segredo único em variável de ambiente.**
- *Decisão:* segredo `EXTERNAL_EMAILS_TOKEN`, enviado pelo chamador no header `x-api-token` (aceitando também `Authorization: Bearer <token>` como fallback), comparado em **tempo constante**; se não configurado, a função recusa (falha fechada).
- *Alternativas:* JWT Supabase (sistemas externos não têm sessão); chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`) compartilhada (poder excessivo); tabela de API keys por cliente (o pedido é um token único; adiado).
- *Por quê:* atende "um token secreto", é simples de rotacionar e não exige schema novo.

**2. Endpoint público sem JWT, com `verify_jwt = false`.**
- *Decisão:* nova função `api-external-emails` declarada em `supabase/config.toml` com `verify_jwt = false` e `import_map` próprio (`deno.json`), como `api-public`/`cron_retry_emails`.
- *Por quê:* o gateway não deve exigir JWT de terceiros; a autorização é feita pela própria função via token.

**3. Remetente/destinatário fixos e payload mínimo.**
- *Decisão:* constantes `FROM = TO = contato@tekua.com.br`; a função aceita apenas `subject` (obrigatório, ≤ 200 chars), `body` (obrigatório, ≤ 20.000 chars) e `replyTo` (opcional, e-mail válido). Campos `to`/`from` enviados pelo chamador são ignorados.
- *Alternativa:* permitir `to` livre do chamador — rejeitado por transformar o endpoint em relay aberto.
- *Por quê:* entrada restrita reduz superfície de abuso e alinha com a decisão do usuário.

**4. Entrega via `email_queue` + retry (assíncrona).**
- *Decisão:* a função grava um registro `type = 'external'` com `status = 'pending'` (reutilizando a coluna `email` como destinatário) e retorna aceito (202) com o `id`; em seguida tenta disparar o processamento do `cron_retry_emails` (best-effort) para entrega quase imediata, mantendo o cron agendado como rede de segurança.
- *Alternativas:* envio síncrono direto (recusado pelo usuário, menos resiliente); tabela de fila dedicada (duplicaria infra e o mecanismo de retry).
- *Por quê:* reaproveita a fila existente e garante que uma falha transitória não perca a solicitação.

**5. Extensão aditiva de `email_queue`.**
- *Decisão:* nova migração adiciona `type text NOT NULL DEFAULT 'invite'`, `subject text`, `body text`, `from_email text`, `updated_at timestamptz DEFAULT now()`. Registros existentes ficam `type = 'invite'` pelo default. A criação de `updated_at` também corrige o bug latente do cron.
- *Alternativa:* nova tabela `external_email_queue` — rejeitada (usuário indicou `email_queue`; fragmentaria fila e retry).
- *Por quê:* mudança retrocompatível, sem backfill destrutivo.

**6. Ramificação por tipo no processador de fila.**
- *Decisão:* `cron_retry_emails` seleciona `type`; se `type = 'external'`, envia via Resend (`POST https://api.resend.com/emails`) usando `from_email`/`email`/`subject`/`body`; caso contrário, mantém `inviteUserByEmail` (tipos nulos tratados como convite). Atualiza `status`/`error_message`/`updated_at` nos dois casos.
- *Por quê:* preserva o fluxo de convites e adiciona o genérico com risco mínimo.

**7. Rate limiting e validação de tamanho.**
- *Decisão:* reutilizar `checkRateLimit` (`_shared/security.ts`) com chave por IP (ex.: `api:external-emails:<ip>`, 10 req/min) e limitar o tamanho do JSON do corpo.
- *Por quê:* reduz abuso do endpoint público.

**8. Documentação de integração e script de teste `curl`.**
- *Decisão:* tutorial em `docs/api-external-emails.md` (seguindo o padrão de `docs/oracle-gemini-config.md`) documentando autenticação (`x-api-token`), URL do endpoint, payload (`subject`/`body`/`replyTo`), respostas (202/400/401/429), limites, nota de segurança sobre remetente/destinatário fixos e rotação do token. Script de teste em `supabase/functions/api-external-emails/test_curl.sh` (seguindo `supabase/functions/cora-payment/test_cora.sh`), parametrizável por URL local/produção e token via variável de ambiente.
- *Alternativas:* apenas um `README.md` dentro da pasta da função (perde a discoverability da pasta `docs/`); documentar só no `proposal`/`design` do OpenSpec (destinado a mantenedores, não a integradores externos).
- *Por quê:* separa a documentação voltada ao integrador do material de planejamento e dá um caminho de verificação reproduzível sem depender de Deno/Supabase CLI instalados.

## Risks / Trade-offs

- **Domínio remetente não verificado no Resend** (`contato@tekua.com.br`) → envios falham no provedor; mitigar verificando o domínio na conta Resend ou ajustando o remetente antes do deploy.
- **Coluna `updated_at` ausente hoje** → enquanto a migração não for aplicada, o cron falha ao atualizar; **aplicar a migração antes** de reimplantar o cron.
- **Endpoint público com segredo único** → se o token vazar, há risco de abuso; mitigar com token forte, rotação e rate limit; chaves por cliente ficam como evolução futura.
- **Reutilizar `email` como destinatário nos registros externos** → a coluna passa a significar "destinatário" (sempre `contato@tekua.com.br`); documentado e sem impacto no fluxo de convites.
- **Acoplamento best-effort com o cron** → se o disparo imediato falhar, a entrega ainda ocorre no ciclo agendado; não deve falhar a resposta da API.

## Migration Plan

1. Aplicar migração que adiciona as colunas a `email_queue` (inclui `updated_at`).
2. Configurar segredos: `supabase secrets set EXTERNAL_EMAILS_TOKEN=<forte>`; confirmar `RESEND_API_KEY`.
3. Deploy de `supabase functions deploy api-external-emails` (e atualizar `config.toml`/`deno.json`).
4. Deploy de `supabase functions deploy cron_retry_emails`.
5. Deploy do frontend (painel da fila).
- **Rollback:** remover o bloco/Deploy da `api-external-emails` e reverter `cron_retry_emails`; as colunas adicionadas são aditivas e podem permanecer (ou ser removidas) sem afetar convites.

## Open Questions

- Exibir prévia do corpo e filtro por tipo no `EmailQueuePanel`? Pode ser adicionado depois sem alterar specs, abordagem ou tarefas.
- Suportar múltiplos tokens por cliente no futuro? Evolução possível sobre a mesma função, sem mudar o contrato atual.
