# Configuração do Google Gemini AI no Oráculo

## Visão Geral

O Oráculo usa o modelo **Gemini 1.5 Flash** da Google via uma Supabase Edge Function (`ai-handler`). O fluxo de comunicação é:

```
Navegador → Supabase Edge Function (ai-handler) → Google Gemini API
```

A chave da API Gemini **nunca** fica exposta no frontend. Toda a comunicação com a Gemini API ocorre no backend (Edge Function), autenticada via Supabase Auth.

---

## 1. Chave da API Gemini (`GEMINI_API_KEY`)

### Produção

A chave deve ser configurada como **segredo da Edge Function** no Supabase:

```bash
# Usando Supabase CLI
supabase secrets set GEMINI_API_KEY=suachaveaqui

# Verificar se foi configurada
supabase secrets list
```

Ou via **Dashboard do Supabase**:
1. Acesse o projeto em `https://supabase.com/dashboard/project/<ref>`
2. Navegue até **Edge Functions** → Seu projeto → **Secrets**
3. Adicione `GEMINI_API_KEY` com o valor da sua chave

### Desenvolvimento Local

Para testes locais com `supabase start`, configure a variável de ambiente:

```bash
supabase secrets set GEMINI_API_KEY=suachaveaqui --local
```

### Obtendo uma chave

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Crie uma API key para o Gemini API
3. A chave não tem custo para uso dentro dos limites gratuitos do Gemini API

---

## 2. Variáveis de Ambiente do Frontend

No arquivo `.env` ou `.env.local`:

```env
# Obrigatório — usada pelo chatWithGemini() para chamar ai-handler
VITE_SUPABASE_URL=https://seuprojeto.supabase.co

# Obrigatório — passada como header "apikey" na requisição
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

A função `chatWithGemini` em `src/lib/gemini.ts` constrói a URL assim:

```ts
const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const response = await fetch(`${baseUrl}/functions/v1/ai-handler`, {
  headers: {
    'Authorization': `Bearer ${token}`,       // token da sessão do usuário
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  body: JSON.stringify({ messages, systemInstruction }),
});
```

---

## 3. Modelo e Configuração da IA

Definido em `supabase/functions/ai-handler/index.ts`:

| Parâmetro | Valor |
|---|---|
| **Modelo** | `gemini-1.5-flash` |
| **SDK** | `@google/generative-ai` (importado via CDN: `https://esm.sh/@google/generative-ai@0.11.4`) |
| **Temperatura** | `0.7` (configurado no `generationConfig`) |
| **Streaming** | Sim — uso de `generateContentStream` |

### Estrutura do Prompt

O sistema combina duas camadas de instruções:

1. **Base System Prompt** (na Edge Function):
   - Define o papel: assistente da Plataforma Tekua
   - Instruções de segurança anti-jailbreak
   - Delimitadores XML (`<user_input>`, `<document_context>`)

2. **Contexto dos Documentos** (enviado pelo frontend via `api-documents` → `getAIContext`):
   - Título, descrição e categoria de todos os documentos oficiais
   - Regras de negócio (moeda Surreal, validações, governança)

---

## 4. Supabase Edge Function (`ai-handler`)

### Localização

`supabase/functions/ai-handler/index.ts`

### Dependências (importadas via CDN no Deno)

```ts
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.11.4';
```

### Funcionalidades

- **Autenticação**: valida sessão via `supabase.auth.getUser(token)`
- **Rate limiting**: 15 mensagens por 60 segundos por usuário (`checkRateLimit`)
- **Sanitização**: bloqueia padrões de injection ("ignore all previous instructions", etc.)
- **Tool calling**: `get_user_balance` e `get_activity_history`
- **Streaming**: retorna eventos SSE com `type: "tool"`, `type: "text"` e `type: "error"`

### Deploy

```bash
# Deploy da edge function
supabase functions deploy ai-handler

# Verificar logs
supabase functions logs ai-handler
```

---

## 5. Resumo de Todas as Configurações

### Backend (Supabase)

| Recurso | Onde Configurar | Exemplo |
|---|---|---|
| `GEMINI_API_KEY` | Supabase Secrets (CLI ou Dashboard) | `AIzaSy...` |
| `ai-handler` function | `supabase/functions/ai-handler/` | Deploy via CLI |
| `api-documents` function | `supabase/functions/api-documents/` | Deploy via CLI |

### Frontend (`.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Anon key pública do Supabase |
| `VITE_VAPID_PUBLIC_KEY` | Não | Apenas para notificações push |

### Segurança

- A chave Gemini **nunca** é exposta ao frontend
- Toda requisição ao `ai-handler` exige token de sessão válido
- Rate limiting previne abuso (15 msg/min)
- Sanitização de input bloqueia prompt injection
- Tools são **read-only** (consulta de saldo e histórico)
- RLS das tabelas é respeitado via `supabaseClient` autenticado

---

## 6. Verificação

Para confirmar que o Gemini está funcionando:

```bash
# 1. Verificar se o segredo está configurado
supabase secrets list

# 2. Checar logs da edge function
supabase functions logs ai-handler

# 3. Pelo frontend, acessar /ai-agent e enviar uma mensagem
#    O console mostrará "Gemini Response:" com os eventos do stream
```
