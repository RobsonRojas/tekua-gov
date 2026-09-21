## Context

A UX atual do Oráculo é básica: o usuário pergunta, a IA responde. Para um público que pode não estar acostumado com LLMs, a interface precisa de affordances visuais. Além disso, a falta de citações na resposta diminui a percepção de oficialidade do assistente.

## Goals / Non-Goals

**Goals:**
- Aumentar a taxa de engajamento do primeiro contato via prompts sugeridos.
- Aumentar a confiança no assistente ao exibir citações documentais explícitas.
- Obter métricas claras da satisfação dos usuários via feedback binário em cada resposta.

**Non-Goals:**
- Não se trata de reconstruir todo o chat do zero, apenas adicionar componentes (chips, botões de ação e parada).
- Não faremos feedback textual ainda (caixa de texto perguntando "Por que você não gostou?"), apenas o sinal binário inicial.

## Decisions

**Abort Controller para Parar Geração:**
- *Decisão:* Adicionar o padrão `AbortController` à chamada do `fetch()` no frontend que inicia o Server-Sent Events (SSE). Quando abortado, o frontend desiste de receber, e idealmente a conexão cortada sinaliza para o Cloud/Edge encerrar a execução.

**Tracking de Feedback (RLHF simples):**
- *Decisão:* Criar uma tabela simples `ai_chat_feedback` no Supabase, vinculando o `user_id`, `message_id` (se existir) ou conteúdo da mensagem, e o valor do rating (`true` ou `false`).
- *Alternativa:* Enviar para uma plataforma de analítics externa (PostHog). Descartado por ser dados de plataforma que podem ser úteis dentro do Supabase para relatórios internos.

## Risks / Trade-offs

- Citações da IA podem ser alucinadas se ela inventar o nome da fonte. Será estritamente mandatório no System Prompt que a IA só faça citações caso as leia literalmente no `<document_context>`.
