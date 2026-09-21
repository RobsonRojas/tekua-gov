## 1. Ajustes do Backend e Banco de Dados

- [x] 1.1 Adicionar ao `BASE_SYSTEM_PROMPT` no `ai-handler` a regra: "Ao usar regras de documentos oficiais, você deve SEMPRE adicionar a citação exata da fonte referenciada no final da resposta."
- [x] 1.2 Criar migration no Supabase para adicionar a tabela `ai_chat_feedback` com as colunas necessárias (`id`, `user_id`, `rating`, `prompt`, `response`, `created_at`).
- [x] 1.3 Criar ou atualizar a Role Security Policy (RLS) para permitir que os usuários insiram na tabela `ai_chat_feedback`.

## 2. Modificações na UI (Componente de Chat)

- [x] 2.1 Adicionar um componente de `SuggestedChips` visível apenas quando o chat estiver vazio ou na tela inicial do Oráculo.
- [x] 2.2 Integrar o `AbortController` ao serviço que invoca a API do `ai-handler` para permitir a funcionalidade "Parar Geração" em um botão temporário exibido durante a recepção do stream.
- [x] 2.3 Implementar a UI (ícones) para curtir/descurtir a resposta da IA, conectando o evento de clique a uma chamada RPC ou `insert` na tabela `ai_chat_feedback`.
- [x] 2.4 Executar validação de build geral (`npm run build`).
