## 1. Backend (ai-handler Edge Function)

- [x] 1.1 Localizar e remover a variável `lastMessage = lastMessage.replace(/<script.*?>.*?<\/script>/gi, '')`.
- [x] 1.2 Localizar e remover as listas Regex (`injectionPatterns`) e seus loops de detecção.
- [x] 1.3 Adicionar as configurações de `safetySettings` da SDK `@google/generative-ai` dentro da inicialização em `getGenerativeModel`.
- [x] 1.4 Expandir e consolidar regras de blindagem no `BASE_SYSTEM_PROMPT`.

## 2. Frontend (Renderização do Chat)

- [x] 2.1 Identificar o componente que faz o parsing de Markdown/respostas do Oráculo (como o visualizado na tela).
- [x] 2.2 Adicionar `DOMPurify` (ou verificar uso do `react-markdown` configurado de forma segura sem permitir HTML cru).
- [x] 2.3 Adicionar testes garantindo que o texto bruto vindo do Edge Function seja santizado corretamente antes de exibido ao DOM.
