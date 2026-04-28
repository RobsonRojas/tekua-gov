## 1. Infraestrutura e Configuração

- [x] 1.1 Configurar chaves de API do Resend no Supabase Vault (Secrets).
- [x] 1.2 Garantir que a extensão `pg_net` esteja habilitada no Supabase para chamadas assíncronas.

## 2. Backend (Edge Functions)

- [x] 2.1 Criar o scaffold da Edge Function `notify-engine` em `supabase/functions/notify-engine/`.
- [x] 2.2 Implementar o roteador de eventos para identificar destinatários (solicitante, executor, ou todos).
- [x] 2.3 Desenvolver os templates de email transacionais para os eventos de demandas e tarefas.
- [x] 2.4 Integrar o envio de Web Push existente dentro da lógica da `notify-engine`.

## 3. Banco de Dados (Postgres)

- [x] 3.1 Criar a função Postgres `handle_task_notification_event` para disparar webhooks.
- [x] 3.2 Configurar Triggers na tabela `demands` para capturar novas publicações.
- [x] 3.3 Configurar Triggers na tabela `tasks` para capturar mudanças de status (assumida, pendente de validação, concluída).

## 4. Frontend e Service Worker

- [x] 4.1 Atualizar a lógica de captura de cliques no Service Worker para suportar redirecionamento dinâmico via metadados da notificação.
- [x] 4.2 Adicionar feedback visual ou configurações básicas de email no perfil do usuário (opcional nesta fase).

## 5. Verificação e Testes

- [x] 5.1 Testar o envio de email transacional em ambiente de desenvolvimento.
- [x] 5.2 Validar a recepção de notificações Push com o portal fechado.
- [x] 5.3 Realizar teste de estresse simples para garantir que o trigger não impacta a latência das operações de banco.
