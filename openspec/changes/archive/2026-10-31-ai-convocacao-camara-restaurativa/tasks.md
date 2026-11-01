## 1. Backend — módulo de ferramentas JR (`jrTools.ts`)

- [x] 1.1 Criar `supabase/functions/ai-justica-restaurativa/jrTools.ts` com a declaração da ferramenta `propose_circle_convocation`: parâmetros `title` (string, required), `scheduledAt` (string ISO 8601, required), `description` (string, optional), `locationOrLink` (string, optional)
- [x] 1.2 Exportar `JR_TOOL_NAME = 'propose_circle_convocation'` e `jrFunctionDeclarations` (array de declarações de ferramenta compatível com `@google/generative-ai`)
- [x] 1.3 Exportar função `executeJrTool(toolName, args)` que retorna o payload de rascunho `{title, scheduledAt, description, locationOrLink}` — sem gravar no banco

## 2. Backend — function calling no `ai-justica-restaurativa/index.ts`

- [x] 2.1 Converter o modelo de `chat.sendMessageStream` para `generateContent` com `tools: [jrFunctionDeclarations]` e loop de execução de ferramentas
- [x] 2.2 Atualizar o system prompt para incluir instrução explícita: ao Passo 4, confirmar pré-círculos, coletar tema e data, chamar `propose_circle_convocation`
- [x] 2.3 No loop de function calling: quando o modelo invocar `propose_circle_convocation`, executar `executeJrTool` e emitir evento `{"type":"tool_draft","tool":"propose_circle_convocation","data":{...}}` no stream antes da resposta textual final
- [x] 2.4 Garantir que mensagens anteriores ao Passo 4 (conversação normal) continuem funcionando — o modelo só invoca a ferramenta quando instruído

## 3. Frontend — processamento do evento `tool_draft` no `AgenteChat`

- [x] 3.1 Em `AgenteChat.tsx`, adicionar processamento do evento `type === 'tool_draft'` na stream do `chatWithJRAgent`, salvando o payload em estado `pendingDraft`
- [x] 3.2 Criar componente `CircleConvocationDraftCard` (inline ou separado) que exibe os dados do rascunho: tema, data/hora formatada, descrição (se presente), local/link (se presente)
- [x] 3.3 Adicionar botão "Confirmar convocação" que chama `apiClient.invoke('api-governance', 'createRestorativeCircle', {...pendingDraft, confirmedPreCircles: true})` e exibe feedback de sucesso (mensagem no chat) ou erro
- [x] 3.4 Adicionar botão "Cancelar" que descarta `pendingDraft` sem chamada à API e mostra mensagem amigável no chat
- [x] 3.5 Após confirmação bem-sucedida, limpar `pendingDraft` e exibir mensagem de sucesso no chat com link para a convocação (usando `share_token` retornado por `createRestorativeCircle`)

## 4. Frontend — atualização de `src/lib/gemini.ts`

- [x] 4.1 Verificar se `chatWithJRAgent` precisa de ajuste para passar o evento `tool_draft` como parte do stream — o backend emite no stream; o frontend deve decodificar e repassar

## 5. Testes e validação

- [x] 5.1 Escrever teste unitário para `jrTools.ts`: `executeJrTool` retorna payload correto com dados válidos, rejeita campos inválidos
- [x] 5.2 Escrever teste de renderização para `CircleConvocationDraftCard`: exibe todos os campos, omite campos opcionais ausentes, chama callback correto ao confirmar e ao cancelar
- [ ] 5.3 Verificar que o loop de function calling não quebra a resposta conversacional normal (Passos 1–3)
- [x] 5.4 Testar cenário de erro: usuário já tem convocação aberta — card exibe erro e agente continua disponível
- [x] 5.5 Executar `npm run build` e `npm run typecheck` para garantir que o build passa sem erros
