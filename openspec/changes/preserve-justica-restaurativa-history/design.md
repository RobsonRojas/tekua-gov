## Context

O chat de Justiça Restaurativa atualmente armazena as mensagens no estado local (`useState` do React) no componente `AgenteChat.tsx`. Quando a página é recarregada, esse estado é perdido.

## Goals / Non-Goals

**Goals:**
- Persistir as mensagens no banco de dados para que possam ser recuperadas em sessões futuras.
- Carregar automaticamente o histórico anterior quando o usuário acessar a tela de chat da Justiça Restaurativa.

**Non-Goals:**
- Múltiplas sessões separadas (threads) para o mesmo usuário. O chat será uma sessão contínua única por usuário, que fará sentido na dinâmica atual.

## Decisions

**1. Data Model para Histórico:**
Criar uma tabela no Supabase chamada `jr_chat_messages` com as colunas:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `role` (text, 'user' ou 'model')
- `content` (text)
- `created_at` (timestamp)

**Alternative:** Guardar um array JSON em uma coluna na tabela `profiles`. 
**Rationale:** Usar uma tabela separada de mensagens (`jr_chat_messages`) permite consultas eficientes, paginação futura (se necessário) e evita problemas de concorrência que ocorreriam ao atualizar grandes objetos JSON no perfil do usuário.

**2. Persistência Frontend x Backend:**
A gravação será feita diretamente pelo Frontend (componente `AgenteChat.tsx`) via Supabase Client após o envio de cada mensagem e recebimento da resposta.
**Alternative:** A gravação poderia ser feita pela Edge Function (`ai-justica-restaurativa`).
**Rationale:** Gravar no frontend aproveita o RLS (Row Level Security) nativo e simplifica a Edge Function, que continuará agindo apenas como ponte com a API do Gemini. As mensagens do usuário são salvas antes de invocar a Edge Function, e a resposta completa do assistente é salva quando o stream for finalizado.

## Risks / Trade-offs

- **Risk**: Histórico muito longo pode exceder o limite de tokens de contexto da Edge Function se o frontend enviar todo o histórico.
- **Mitigation**: Por enquanto, enviar as últimas N mensagens (ex: últimas 20) na chamada da Edge Function, enquanto a tabela mantém todo o histórico. O componente frontend precisa limitar o `history` enviado ao `chatWithJRAgent`.
