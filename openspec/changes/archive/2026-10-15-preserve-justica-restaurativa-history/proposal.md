## Why

Atualmente, o agente de Justiça Restaurativa não preserva o histórico do chat do usuário entre as sessões. Isso significa que, se o usuário recarregar a página ou voltar mais tarde, a conversa anterior é perdida, e ele precisa começar tudo de novo. Para um processo de justiça restaurativa, que exige continuidade e construção de confiança, é essencial que o histórico seja salvo e recuperado automaticamente.

## What Changes

- As mensagens do chat de Justiça Restaurativa passarão a ser salvas no banco de dados (Supabase) associadas ao usuário atual.
- Ao carregar o chat, o componente buscará e exibirá o histórico de mensagens anteriores do usuário.
- O backend será adaptado para gravar as mensagens do usuário e as respostas do agente.

## Capabilities

### New Capabilities

### Modified Capabilities
- `justica-restaurativa-agente`: Adiciona o requisito de que o histórico de conversa com o agente deve ser persistido e recuperado para cada usuário individualmente.

## Impact

- **Frontend**: `src/components/JusticaRestaurativa/AgenteChat.tsx` e possivelmente `src/lib/gemini.ts` ou funções de API.
- **Backend/DB**: Necessidade de criar uma tabela para histórico (ex: `jr_chat_history`) ou usar uma função do Supabase (`ai-justica-restaurativa`) para gerenciar as inserções/leituras, dependendo da arquitetura.
