## Why

Atualmente, o histórico de conversa do Oráculo não é persistido de forma robusta e vinculada ao usuário após fechar a aba ou terminar a sessão. Preservar o histórico de mensagens permite que os membros retornem a dúvidas anteriores, mantenham o contexto e continuem conversas de onde pararam.

## What Changes

- O sistema passará a armazenar o histórico de conversas do chat da IA vinculado à conta do usuário (no Supabase).
- O Frontend passará a carregar as últimas 20 mensagens da conversa no carregamento inicial da página do Oráculo, com a opção de carregar 20 mensagens anteriores clicando em um botão no topo do chat.

## Capabilities

### New Capabilities
- `ai-chat-history`: Novo requisito para permitir salvar e carregar o histórico de conversação do usuário logado no banco de dados.

### Modified Capabilities
- `ai-guidance`: A resiliência e contexto da IA deve refletir que ela entende as conversas em múltiplas sessões, não sendo mais efêmera.

## Impact

- Supabase Database (nova tabela ou ampliação para armazenar o chat).
- Supabase Edge Functions (`ai-handler`) para ler e injetar o histórico no array de mensagens enviado ao modelo.
- Frontend Chat Component (recuperação do estado na carga inicial).
