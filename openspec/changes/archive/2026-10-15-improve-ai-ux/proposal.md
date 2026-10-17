## Why

Atualmente a interface do Oráculo é reativa, dependendo de o usuário formular uma pergunta clara. O agente não quebra o gelo ativamente nem provê transparência sobre as fontes das suas respostas, o que diminui a confiança e engajamento. Adicionalmente, quando uma resposta se prolonga indesejadamente por conta do streaming de texto, o usuário não tem como interrompê-la. Também falta uma maneira de captar a satisfação do usuário para melhoria contínua da IA.

## What Changes

- Adicionar "Suggested Prompts" (chips) no início da conversa para guiar o usuário em suas primeiras interações.
- Instruir o LLM (via System Prompt) a sempre anexar uma citação da fonte original da documentação sempre que fornecer fatos ou regras da plataforma.
- Adicionar botões de *Like* (👍) e *Dislike* (👎) em cada mensagem finalizada da IA, gravando o feedback no banco de dados.
- Implementar um controle no Frontend para Cancelar/Parar o stream de texto (abortando a requisição `fetch`).

## Capabilities

### Modified Capabilities

- `ai-guidance`: A interface e o comportamento do Oráculo passam a exigir maior usabilidade com botões de sugestões, feedback e capacidade de interrupção, além da obrigatoriedade de citação de fontes por parte da IA.

## Impact

- Modificações na camada UI (provavelmente um componente de Chat do Frontend).
- Ajuste no `BASE_SYSTEM_PROMPT` no `ai-handler` (apenas para a instrução de citar fontes).
- Criação de nova tabela no Supabase para armazenar os feedbacks (RLHF tracking).
