## 1. Atualização no Backend (Edge Function)

- [x] 1.1 Modificar `supabase/functions/ai-handler/index.ts` e corrigir a função `getFallbackModels` para usar nomes de modelos suportados pela API v1beta atual (por exemplo, `gemini-1.5-flash` e `gemini-1.5-pro`) removendo ou atualizando o nome do modelo `gemini-2.0-flash-exp` que está retornando 404.

## 2. Deploy e Validação

- [x] 2.1 Fazer o deploy da edge function `ai-handler` com a correção aplicada (`npx supabase functions deploy ai-handler`).
- [x] 2.2 Executar validação de build geral (`npm run build`) para garantir a integridade da aplicação, conforme as Regras Específicas do Workspace (Tekuá).
- [x] 2.3 Confirmar que o erro 404 deixou de ocorrer e que as requisições de fallback são concluídas com sucesso.
