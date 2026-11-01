## Context

O `ai-justica-restaurativa` é uma edge function Deno que usa `@google/generative-ai` em modo streaming puro — sem suporte a function calling. O `ai-handler` (Oráculo/Work Wall) já implementa o padrão completo de function calling com loop de execução de ferramentas (`functionDeclarationsFor`, `workWall.ts`). A mudança traz o mesmo padrão para o agente JR.

O frontend (`AgenteChat.tsx`) consome a stream via `chatWithJRAgent` em `src/lib/gemini.ts` e processa eventos `text_chunk`, `text_complete` e `error`. Precisa passar a processar também `tool_draft`.

Ver proposal.md – Why para motivação.

## Goals / Non-Goals

**Goals:**
- Function calling no `ai-justica-restaurativa` para `propose_circle_convocation`.
- Frontend exibe card de confirmação e chama `createRestorativeCircle` ao confirmar.
- O agente nunca escreve no banco — confirmação é sempre do usuário.

**Non-Goals:**
- Migração do `ai-justica-restaurativa` para o `ai-handler` (são funções distintas com propósitos diferentes).
- Suporte a outras ferramentas de escrita no agente JR nesta mudança.
- Edição do rascunho proposto pelo agente (usuário confirma ou cancela; revisão é feita em nova conversa).

## Decisions

### D1 – Extrair módulo `jrTools.ts` no `ai-justica-restaurativa`

**Escolha:** Criar `supabase/functions/ai-justica-restaurativa/jrTools.ts` com a declaração da ferramenta `propose_circle_convocation` e a lógica de execução — mesmo padrão do `workWall.ts` no `ai-handler`.

**Rationale:** Mantém `index.ts` focado no request handling, facilita testes unitários e segue o padrão já estabelecido no projeto.

### D2 – Loop de function calling no `index.ts` do `ai-justica-restaurativa`

**Escolha:** Converter o model de streaming puro para `generateContent` com `tools` e loop de execução de ferramentas, emitindo eventos `tool_draft` quando `propose_circle_convocation` é chamada.

**Alternativa considerada:** Manter streaming e usar heurísticas de texto para detectar intenção de convocar — frágil, não determinístico e difícil de testar.

**Rationale:** Function calling é o padrão correto e já provado no projeto. Aceita-se a perda do streaming token-a-token nas mensagens do agente (o loop de function calling retorna texto completo), o que é aceitável para o fluxo do Passo 4.

### D3 – Evento `tool_draft` no stream com payload JSON

**Escolha:** A edge function emite `{"type":"tool_draft","tool":"propose_circle_convocation","data":{...}}` no stream antes da resposta textual do agente.

**Rationale:** Consistente com os eventos `text_chunk`, `text_complete` e `error` já tratados pelo frontend. O frontend filtra por `type === 'tool_draft'` e renderiza o card.

### D4 – Card de confirmação no `AgenteChat` com chamada direta a `api-governance`

**Escolha:** O card exibe os dados do rascunho com botões "Confirmar convocação" e "Cancelar". Ao confirmar, o `AgenteChat` chama `apiClient.invoke('api-governance', 'createRestorativeCircle', {...})` com `confirmedPreCircles: true` (já confirmado conversacionalmente pelo agente).

**Rationale:** Reutiliza o handler existente sem duplicar lógica de criação. O `confirmedPreCircles: true` é seguro porque o agente coleta essa confirmação verbal antes de propor o rascunho.

### D5 – System prompt atualizado para guiar o uso da ferramenta

**Escolha:** Adicionar instrução explícita no system prompt de que, ao chegar ao Passo 4, o agente deve confirmar os pré-círculos, coletar dados e chamar `propose_circle_convocation`.

**Rationale:** Sem instrução explícita, o modelo pode ignorar a ferramenta e dar apenas orientação verbal.

## Risks / Trade-offs

- **Perda de streaming token-a-token** no Passo 4: O loop de function calling retorna texto completo. As mensagens anteriores ao Passo 4 podem continuar em streaming se o modelo não invocar a ferramenta nessa rodada. → Aceito; o fluxo de convocação é estruturado, não requer streaming.
- **Modelo pode invocar ferramenta prematuramente** (sem todos os dados): A declaração da ferramenta marca `title` e `scheduledAt` como `required`, forçando o modelo a coletar antes de chamar. → Mitigado pela declaração de parâmetros obrigatórios.
- **Usuário pode ter uma convocação aberta** (restrição de `one_open_per_author`): `createRestorativeCircle` já retorna erro nesse caso; o card deve exibir esse erro ao usuário. → Tratado no error handling existente.

## Open Questions

Nenhuma — todas as decisões necessárias para implementação estão resolvidas.
