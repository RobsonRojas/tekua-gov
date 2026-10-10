# API de E-mails Externos (`api-external-emails`)

Endpoint dedicado para que **aplicações externas** solicitem o envio de um e-mail transacional para a Tekuá. O destinatário e o remetente são **sempre** `contato@tekua.com.br` — o chamador fornece apenas o assunto e o corpo.

> A integração exige um **token secreto** fornecido pela Tekuá. O token autoriza o envio; sem ele a solicitação é recusada.

## Resumo

| Item | Valor |
| --- | --- |
| Método | `POST` |
| Autenticação | Token secreto no header `x-api-token` (ou `Authorization: Bearer <token>`) |
| Destinatário | Sempre `contato@tekua.com.br` (não configurável) |
| Remetente | Sempre `contato@tekua.com.br` (não configurável) |
| Entrega | Assíncrona (fila + reprocessamento) |

## URL do endpoint

- **Local:** `http://localhost:54321/functions/v1/api-external-emails`
- **Produção:** `https://<PROJECT-REF>.supabase.co/functions/v1/api-external-emails`

Substitua `<PROJECT-REF>` pela referência do projeto Supabase da Tekuá.

## Autenticação

Envie o token secreto em **um** destes headers:

```
x-api-token: <SEU_TOKEN>
```

ou, como alternativa:

```
Authorization: Bearer <SEU_TOKEN>
```

O token é comparado em tempo constante no servidor. Sem token válido a resposta é sempre `401` (sem revelar detalhes).

## Corpo da requisição

`Content-Type: application/json`

| Campo | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- |
| `subject` | string | Sim | Não pode ser vazio; máx. **200** caracteres |
| `body` | string | Sim | Não pode ser vazio; máx. **20.000** caracteres (HTML permitido) |
| `replyTo` | string | Não | E-mail válido; usado como endereço de resposta |

> **Importante:** quaisquer campos `to` ou `from` enviados no corpo são **ignorados**. O e-mail sempre sai de `contato@tekua.com.br` para `contato@tekua.com.br`.

### Exemplo de corpo

```json
{
  "subject": "Nova mensagem do formulário de contato",
  "body": "<p>Olá, gostaria de saber mais sobre os projetos.</p>",
  "replyTo": "visitante@exemplo.com"
}
```

## Respostas

| Código | Significado | Corpo (exemplo) |
| --- | --- | --- |
| `202` | Aceito e enfileirado | `{ "success": true, "id": "<uuid>", "status": "queued" }` |
| `400` | Payload inválido (campo ausente/ inválido/ grande demais) | `{ "error": "missing_subject" }` |
| `401` | Token ausente, inválido ou não configurado | `{ "error": "unauthorized" }` |
| `405` | Método diferente de `POST` | `{ "error": "method_not_allowed" }` |
| `429` | Excesso de requisições | `{ "error": "rate_limited" }` |
| `500` | Erro interno | `{ "error": "internal_error" }` |

Códigos `400` possíveis: `invalid_json`, `missing_subject`, `subject_too_long`, `missing_body`, `body_too_long`, `invalid_reply_to`.

## Limites

- **Tamanho:** `subject` ≤ 200 caracteres; `body` ≤ 20.000 caracteres.
- **Taxa:** até **10 requisições por minuto por IP**. Excedeu? Aguarde a próxima janela (resposta `429`).

## Exemplos

### curl

```bash
curl -X POST "https://<PROJECT-REF>.supabase.co/functions/v1/api-external-emails" \
  -H "Content-Type: application/json" \
  -H "x-api-token: $EXTERNAL_EMAILS_TOKEN" \
  -d '{
    "subject": "Nova mensagem do formulário de contato",
    "body": "<p>Olá, gostaria de saber mais sobre os projetos.</p>",
    "replyTo": "visitante@exemplo.com"
  }'
```

### JavaScript / TypeScript

```js
const response = await fetch(
  'https://<PROJECT-REF>.supabase.co/functions/v1/api-external-emails',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-token': process.env.EXTERNAL_EMAILS_TOKEN, // nunca embuta no cliente
    },
    body: JSON.stringify({
      subject: 'Nova mensagem do formulário de contato',
      body: '<p>Olá, gostaria de saber mais sobre os projetos.</p>',
      replyTo: 'visitante@exemplo.com',
    }),
  },
)

if (!response.ok) throw new Error(`Falha ao enviar: ${response.status}`)
const { id } = await response.json()
console.log('Enfileirado com id:', id)
```

### Python

```python
import os
import requests

response = requests.post(
    "https://<PROJECT-REF>.supabase.co/functions/v1/api-external-emails",
    headers={
        "Content-Type": "application/json",
        "x-api-token": os.environ["EXTERNAL_EMAILS_TOKEN"],
    },
    json={
        "subject": "Nova mensagem do formulário de contato",
        "body": "<p>Olá, gostaria de saber mais sobre os projetos.</p>",
        "replyTo": "visitante@exemplo.com",
    },
    timeout=15,
)
response.raise_for_status()
print("Enfileirado com id:", response.json()["id"])
```

## Como testar

Há um script pronto que exercita os casos de sucesso e de falha: [`supabase/functions/api-external-emails/test_curl.sh`](../supabase/functions/api-external-emails/test_curl.sh).

```bash
# Contra o ambiente local (padrão), com o token configurado localmente:
EXTERNAL_EMAILS_TOKEN="<token>" bash supabase/functions/api-external-emails/test_curl.sh

# Contra produção:
BASE_URL="https://<PROJECT-REF>.supabase.co" \
EXTERNAL_EMAILS_TOKEN="<token>" \
  bash supabase/functions/api-external-emails/test_curl.sh
```

## Como rodar localmente

1. Configure o token secreto no arquivo de ambiente local (não versionado), por exemplo `supabase/.env.local`:

   ```
   EXTERNAL_EMAILS_TOKEN=um-token-forte-e-secreto
   RESEND_API_KEY=re_xxx
   ```

2. Suba a função com o ambiente:

   ```bash
   supabase functions serve api-external-emails --env-file ./supabase/.env.local
   ```

3. Acesse em `http://localhost:54321/functions/v1/api-external-emails`.

## Como publicar (produção)

1. Defina os segredos no projeto:

   ```bash
   supabase secrets set EXTERNAL_EMAILS_TOKEN="<token-forte>"
   # RESEND_API_KEY já deve estar configurado (usado pelo notify-engine)
   ```

2. Faça o deploy:

   ```bash
   supabase functions deploy api-external-emails
   ```

3. Garanta que o domínio remetente `tekua.com.br` esteja **verificado** na conta Resend (o envio usa `contato@tekua.com.br`).

## Segurança

- **Nunca** embuta o token em código de front-end, repositório público ou logs. Use variáveis de ambiente/secret manager do seu backend.
- O endpoint **não** é um relay aberto: remetente e destinatário são fixos, impedindo uso indevido para enviar a terceiros.
- **Rotação do token:** gere um novo valor forte, atualize `EXTERNAL_EMAILS_TOKEN` via `supabase secrets set` (e nos integradores), e reimplante a função. O token antigo deixa de funcionar imediatamente.
- Em caso de erro, as respostas não revelam se o token está configurado nem detalhes internos.
