## 1. Configuração de Inteligência Artificial

- [ ] 1.1 Criar conta de serviço e obter API Key do Google Gemini no Vertex AI / AI Studio.
- [ ] 1.2 Configurar variável de ambiente `VITE_GEMINI_API_KEY` (.env).
- [ ] 1.3 Instalar o SDK `@google/generative-ai`.
- [ ] 1.4 Criar utilitário de conexão `src/lib/gemini.ts`.

## 2. Interface do Agente IA

- [ ] 2.1 Criar a página de conversação `src/pages/AIAgent.tsx`.
- [ ] 2.2 Reutilizar componentes de UI para o chat (balões de mensagem, campo de inserção, animação de digitação).
- [ ] 2.3 Implementar mensagens de boas-vindas e disclaimer de IA.

## 3. Lógica de Contexto e Tradução

- [ ] 3.1 Desenvolver função para buscar resumos de documentos oficiais e injetar no prompt do Gemini.
- [ ] 3.2 Implementar sistema de streaming de resposta para melhor experiência do usuário (UX).
- [ ] 3.3 Adicionar traduções (i18n) para a interface do chat no `translation.json`.

## 4. Testes e Validação

- [ ] Implementar testes unitários para a lógica de negócio e componentes principais (Vitest).
- [ ] Implementar testes de integração/E2E cobrindo o fluxo principal descrito (Playwright).
- [ ] Validar o build final e a conformidade com as especificações.
