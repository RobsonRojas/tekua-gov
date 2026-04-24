## 1. Configuração de Inteligência Artificial

- [x] 1.1 Criar conta de serviço e obter API Key do Google Gemini no Vertex AI / AI Studio.
- [x] 1.2 Configurar variável de ambiente `VITE_GEMINI_API_KEY` (.env).
- [x] 1.3 Instalar o SDK `@google/generative-ai`.
- [x] 1.4 Criar a Supabase Edge Function `ai-handler` para processar chamadas ao Gemini.
- [x] 1.5 Configurar secrets no Supabase (`GEMINI_API_KEY`).
- [x] 1.6 Refatorar `src/lib/gemini.ts` para usar `supabase.functions.invoke`.

## 2. Interface do Agente IA

- [x] 2.1 Criar a página de conversação `src/pages/AIAgent.tsx`.
- [x] 2.2 Reutilizar componentes de UI para o chat (balões de mensagem, campo de inserção, animação de digitação).
- [x] 2.3 Implementar mensagens de boas-vindas e disclaimer de IA.

## 3. Lógica de Contexto e Tradução

- [x] 3.1 Desenvolver função para buscar resumos de documentos oficiais e injetar no prompt do Gemini.
- [x] 3.2 Implementar sistema de streaming de resposta para melhor experiência do usuário (UX).
- [x] 3.3 Adicionar traduções (i18n) para a interface do chat no `translation.json`.

## 4. Testes e Validação

- [x] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [x] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [x] Validar o build final e a conformidade com as especificações.
