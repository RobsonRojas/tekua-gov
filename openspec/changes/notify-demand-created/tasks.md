## 1. Entrega In-App (notify-engine)

- [x] 1.1 Corrigir o insert de notificação in-app em `supabase/functions/notify-engine/index.ts`: usar as colunas reais `title`/`message` no formato i18n JSONB `{ pt, en }` (hoje grava a coluna inexistente `content` com strings simples).
- [x] 1.2 Isolar o processamento por destinatário (ex.: `Promise.allSettled` ou try/catch por destinatário) para que a falha de gravação/push/email de um destinatário não interrompa a entrega aos demais nem a resposta da função.

## 2. Evento activity.created

- [x] 2.1 Ajustar a seleção de destinatários de `activity.created`: usar `executor_ids` quando presentes; caso contrário, todos os membros **excluindo o `requester_id`** (criador da demanda).
- [x] 2.2 Ajustar o template de `activity.created` para gravar `title`/`message` i18n (`{ pt, en }`) na notificação in-app e manter strings simples para push/email, com `link` apontando para a demanda no Work Wall.

## 3. Validação

- [x] 3.1 Verificar o fluxo ponta a ponta: conferir que a notificação de demanda criada é gravada com o formato que o frontend renderiza (`notif.title[lang] || notif.title.pt`) e que push/email usam strings simples.
- [x] 3.2 Rodar as verificações do workspace (build/typecheck do frontend) e `openspec validate notify-demand-created` para confirmar que nada foi quebrado.