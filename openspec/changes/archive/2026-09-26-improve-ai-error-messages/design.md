## Context

A API do Gemini e o SDK (`@google/generative-ai`) lançam exceções detalhadas em caso de falhas de autenticação, quotas ou modelos não encontrados (como 404). Atualmente, a Edge Function `ai-handler` não intercepta o erro no loop de fallback de forma a mascará-lo para o cliente, frequentemente enviando o erro real na resposta.

## Goals / Non-Goals

**Goals:**
- Interceptar exceções disparadas pelo SDK do Gemini no backend (`ai-handler`).
- Retornar uma resposta de texto de erro genérica e amigável ao cliente, aproveitando o formato SSE/stream para que apareça como uma resposta do bot.
- Preservar logs originais no Supabase para facilitar troubleshooting.

**Non-Goals:**
- Criar novos fluxos de UI para tratamento de erro no frontend (o foco é que a UI continue renderizando como texto normal do bot).

## Decisions

1. **Retornar Erro via Stream Textual**:
   - *Decisão*: O bloco `try/catch` principal que lida com o loop de fallback no `ai-handler` captura o erro e tenta o próximo modelo. Se a lista de modelos se esgotar, ao invés de lançar o `lastError` bruto ou fechar o stream incorretamente, o código montará um chunk SSE manual ou emitirá a string "Nossos sistemas de IA estão temporariamente indisponíveis. Por favor, tente novamente mais tarde."
   - *Alternativa Considerada*: Retornar HTTP 500. Se a requisição retornasse 500 puro com texto, o frontend poderia não processar adequadamente se já estiver esperando um EventStream, resultando em tela branca ou log no console do browser sem feedback claro na interface de chat. Enviar a mensagem via stream como fala do bot é a melhor UX.

## Risks / Trade-offs

- **Risco**: Falhar no meio da geração de uma resposta parcial (ex: "O estatuto diz... [ERRO]").
- **Mitigação**: Normalmente erros como 404 e auth ocorrem antes do primeiro chunk. Se for um timeout no meio, a frase de erro pode ser truncada na interface, mas ainda assim é melhor do que um stack trace puro.
