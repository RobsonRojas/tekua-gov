## Context

O usuário do portal não possui um local para revisar suas próprias interações. Ter um histórico de atividades centralizado é vital para auditoria pessoal, permitindo que o membro verifique quando e o que votou, quais tarefas completou e quando acessou a conta. Isso também ajuda em possíveis disputas ou dúvidas sobre a participação na associação.

## Goals / Non-Goals

**Goals:**
- Implementar a tabela de log de atividades persistente.
- Criar a interface de Timeline (linha do tempo) no perfil.
- Diferenciar os tipos de atividades (Autenticação, Votação, Tarefas, Documentos).
- Garantir a privacidade (membros não veem atividades de outros, apenas as próprias).

**Non-Goals:**
- Auditoria administrativa global (será tratada em um painel administrativo de logs separado, no futuro).
- Exportação de logs em formato CSV/PDF nesta fase.

## Decisions

- **Schema Management**: Criar tabela `activity_logs` com FK para `profiles`.
- **UI Architecture**: Utilizar componentes de timeline do MUI ou uma lista seccionada por data.
- **Data Fetching**: Paginação simples para não sobrecarregar a tela de carregamento (ex: carregar os últimos 50 eventos).
- **Log Injection**: Inserir chamadas de registro de log (`insert log`) nos fluxos de `signIn`, `confirmVote`, `submitTask` e `updateProfile`.

## Risks / Trade-offs

- **Performance**: O crescimento rápido da tabela de logs pode tornar a consulta lenta. É fundamental ter bons índices em `user_id` e `created_at`.
- **Incompleteness**: Logs retroativos não são possíveis. A auditoria passará a contar apenas após a implementação desta mudança.
