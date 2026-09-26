## Context

Veja proposal.md para motivação. O chat do Oráculo atualmente não salva o estado da conversa, sendo reiniciado ao fechar o modal ou atualizar a página. Precisamos persistir o histórico no Supabase.

## Goals / Non-Goals

**Goals:**
- Armazenar o histórico de mensagens entre o usuário logado e o Oráculo.
- Restaurar as mensagens ao abrir o chat novamente.

**Non-Goals:**
- Múltiplas conversas/threads independentes. O foco será ter 1 única thread de histórico contínuo por usuário, com limite de contexto, para simplificar.

## Decisions

- **Armazenamento Supabase:** Criaremos uma tabela `ai_chat_sessions` com as colunas `user_id` (PK, referenciando `auth.users`), `messages` (JSONB) e `updated_at`.
  - *Alternativa:* Guardar nas tabelas do `profiles`. *Razão:* Tabela separada não onera consultas comuns no perfil e deixa escalável para caso adicionemos threads (múltiplos `session_id`) no futuro.
- **Lógica Frontend (React):** O componente de chat (`OracleChat` ou similar) irá buscar a linha em `ai_chat_sessions` no mount e inicializar o state de mensagens.
- **Atualização do Histórico:** Ao terminar uma iteração (user envia mensagem e IA responde via stream), o frontend enviará as mensagens atualizadas para a tabela `ai_chat_sessions` (usando `upsert`).
- **Gestão de Token Window:** O frontend passará a mandar na API call para a Edge Function as mensagens truncadas caso fiquem muito grandes.

## Risks / Trade-offs

- [Custo e Estouro da Janela de Contexto] -> O histórico da DB pode ficar enorme ao longo de meses, o que daria erro na API do Gemini. *Mitigação:* O frontend mandará apenas as últimas N mensagens ao bater no `ai-handler`, mesmo carregando o array completo da DB, mantendo um recorte (ex: ultimas 10 mensagens).
