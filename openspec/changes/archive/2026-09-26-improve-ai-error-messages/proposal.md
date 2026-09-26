## Why

Atualmente, quando os sistemas de inteligência artificial (como a API do Gemini) enfrentam problemas, como erros 404 (modelos não encontrados) ou instabilidades, o backend repassa o erro técnico diretamente para o usuário final. Mensagens como `[GoogleGenerativeAI Error]: Error fetching from...` geram confusão, quebram a imersão na interface de chat e expõem detalhes de infraestrutura desnecessariamente. É necessário interceptar esses erros e fornecer respostas amigáveis.

## What Changes

- **Sanitização de Erros**: O `ai-handler` (Supabase Edge Function) interceptará erros técnicos gerados durante as chamadas à API de IA.
- **Mensagem Amigável**: Em caso de falha persistente de todos os modelos de fallback, o sistema retornará uma mensagem padrão e amigável, como "Nossos sistemas de IA estão temporariamente indisponíveis. Por favor, tente novamente mais tarde."
- **Logs Internos**: Os detalhes técnicos (stack trace, erro original, HTTP status) continuarão sendo logados no console do backend (Supabase Logs) para fins de depuração, sem vazar para o cliente.

## Capabilities

### New Capabilities

### Modified Capabilities
- `ai-guidance`: O backend agora retornará mensagens de erro padronizadas e amigáveis ao invés de repassar erros HTTP/SDK brutos em caso de falha da API Gemini.

## Impact

- **Backend**: Modificação na Edge Function `ai-handler` (`supabase/functions/ai-handler/index.ts`) para capturar exceções gerais no loop de stream e retornar uma resposta de texto contendo a mensagem de erro amigável, ou emitir um evento de erro formatado.
- **UX**: O usuário final não verá mais stack traces do `GoogleGenerativeAI`, melhorando a experiência.
