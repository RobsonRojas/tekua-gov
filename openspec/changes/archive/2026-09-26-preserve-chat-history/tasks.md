## 1. Banco de Dados

- [x] 1.1 Criar migration SQL para adicionar a tabela `ai_chat_sessions` com as colunas `user_id` (UUID, reference auth.users), `messages` (JSONB), e `updated_at` (TIMESTAMP).
- [x] 1.2 Configurar Row Level Security (RLS) para permitir que apenas o próprio usuário leia, insira ou atualize o seu registro.

## 2. Lógica Frontend (Chat State)

- [x] 2.1 Adicionar queries do supabase no cliente (`src/lib/supabase.ts` ou hooks apropriados) para buscar `ai_chat_sessions` pelo `user_id`.
- [x] 2.2 Modificar o componente `OracleChat` (ou onde o state do chat reside) para que no `useEffect` (on mount) carregue o histórico e popula o state `messages`.
- [x] 2.3 Após o carregamento, certificar de que as mensagens estão na estrutura correta (`{ role: 'user' | 'model', content: '...' }`).

## 3. Persistência de Mensagens e Integração

- [x] 3.1 Ao enviar nova mensagem, disparar `upsert` no Supabase com o novo array `messages` (ou via Edge Function, se for o caso).
- [x] 3.2 Modificar o handler pós-stream de IA para capturar a resposta completa do modelo e atualizar a tabela `ai_chat_sessions` agregando a resposta do assistant.
- [x] 3.3 Truncar o histórico (ex: enviar apenas as últimas N mensagens) na chamada da API para a Edge Function `ai-handler` para economizar tokens/evitar limites.

## 4. Validação

- [x] 4.1 Executar validação de build geral (`npm run build`).
