# Integração Cora Payment (Supabase Edge Function)

Este manual detalha a configuração e o uso da Edge Function `cora-payment` no Supabase para processar pagamentos via PIX, Boleto e Cartão de Crédito utilizando a API Cora Pro.

## 1. Configuração no Supabase

### Variáveis de Ambiente
A Edge Function exige que as credenciais da Cora Pro estejam configuradas no seu projeto Supabase. Adicione as seguintes variáveis (Secrets):

- `CORA_CLIENT_ID`: Client ID fornecido pela Cora Pro.
- `CORA_CLIENT_SECRET`: Client Secret da Cora Pro.
- `CORA_MTLS_CERT`: (Opcional, se usar mTLS) Certificado para autenticação.
- `SUPABASE_SERVICE_ROLE_KEY`: Usado internamente pela Edge Function para atualizar o banco de dados via webhook sem burlar as políticas do RLS de forma insegura, garantindo a integridade dos dados de pagamento.

**Comando para adicionar os secrets localmente e no projeto remoto:**
```bash
supabase secrets set CORA_CLIENT_ID="seu_client_id"
supabase secrets set CORA_CLIENT_SECRET="seu_secret"
```

### Deploy da Edge Function
Faça o deploy da function para o seu projeto Supabase:
```bash
supabase functions deploy cora-payment --no-verify-jwt
```
*(Usamos `--no-verify-jwt` porque a function precisa receber os webhooks externos da Cora sem exigir um token de usuário logado na rota `/webhook`).*

---

## 2. Como usar a partir de um site externo (Frontend)

Sua aplicação cliente (React, Vue, ou até mesmo um script externo) deve fazer requisições HTTP para a Edge Function para gerar pagamentos.

### Criando um Pagamento (PIX, Boleto ou Cartão)

Faça uma requisição `POST` para a rota `/create` da sua Edge Function. 
**Não é obrigatório que o site externo tenha um sistema de login ou cadastro.** Você pode processar pagamentos de duas formas:
1. **Sem login (Visitante/Guest):** Omitindo o token e enviando os dados completos do cliente no corpo da requisição (CPF, Email, Nome). A função identificará o cliente apenas por esses dados.
2. **Com usuário logado (Opcional):** Enviando o `Authorization: Bearer <token>` para vincular o pagamento diretamente à conta do Supabase.

**Exemplo com JavaScript (Fetch API) - Compatível com visitantes (sem login):**
```javascript
const response = await fetch('https://rhpcenqbelifilylwujy.supabase.co/functions/v1/cora-payment/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // 'Authorization': `Bearer ${session.access_token}` // Descomente apenas se o site externo possuir sistema de login
  },
  body: JSON.stringify({
    amount: 150.00,
    payment_method: 'PIX', // Pode ser 'PIX', 'BOLETO' ou 'CREDIT_CARD'
    description: 'Pagamento de Mensalidade Tekuá',
    customer: {
      name: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@email.com'
    }
  })
});

const data = await response.json();
console.log(data); // Retornará o QRCode do PIX, link do boleto, etc.
```

---

## 3. Configuração de Webhooks na Cora Pro

Para que o sistema saiba quando o cliente pagou o boleto ou o PIX, a Cora precisa enviar um "aviso" (Webhook) de volta para o Supabase.

1. Acesse o painel de desenvolvedor da Cora Pro.
2. Cadastre uma nova URL de Webhook apontando para:
   `https://rhpcenqbelifilylwujy.supabase.co/functions/v1/cora-payment/webhook`
3. Selecione os eventos que deseja escutar (ex: `payment.paid`, `payment.failed`, `payment.expired`).

Quando a Cora enviar os dados para essa URL, a Edge Function irá:
1. Validar a assinatura da Cora para garantir que a requisição é legítima.
2. Atualizar o status do pagamento na tabela `cora_payments` (usando a chave Service Role).

## 4. Tabela de Dados
Os pagamentos gerados e seus respectivos status são salvos automaticamente na tabela `cora_payments`. A Edge Function fará as inserções de pagamentos "pendentes" (pending) no `/create` e a atualização para "pago" (paid) ou outro status retornado pelo `/webhook`.

---

## 5. Como o site externo sabe que o pagamento foi concluído?

Para exibir uma "tela de agradecimento" assim que o cliente pagar (muito útil para PIX), o site externo precisa ser avisado. A melhor forma de fazer isso usando a arquitetura do Supabase é através do **Supabase Realtime (WebSockets)**.

Como a Edge Function atualiza a tabela `cora_payments` automaticamente quando recebe o webhook da Cora, o seu site externo pode simplesmente "escutar" as mudanças dessa tabela em tempo real.

**Exemplo (Supabase JS Client):**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('URL_DO_PROJETO', 'CHAVE_ANON_DO_PROJETO')

// O 'paymentId' é o ID do pagamento que foi retornado na chamada do POST /create
const subscription = supabase
  .channel('pagamento-status')
  .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'cora_payments',
      filter: `id=eq.${paymentId}`
    },
    (payload) => {
      if (payload.new.status === 'paid') {
        console.log('Pagamento recebido na hora!');
        // Aqui você aciona a exibição da Tela de Agradecimento/Sucesso
      }
    }
  )
  .subscribe()
```
*(Nota: Para isso funcionar, certifique-se de que as políticas de segurança (RLS) da tabela `cora_payments` permitam a leitura. Uma alternativa ao Realtime é fazer **Polling**, onde o site faz um `GET /status?id=xxx` a cada 3 segundos perguntando se já foi pago).*
