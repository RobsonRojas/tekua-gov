## Why

Atualmente, na página de detalhes da tarefa do Mural de Trabalho (Work Wall), os usuários podem comentar para interagir e tirar dúvidas. No entanto, não há como notificar proativamente um usuário específico (como o autor da tarefa ou um administrador) ao fazer uma pergunta ou observação importante no comentário. Implementar um sistema de menções ("@" seguido do nome do usuário) resolve isso, melhorando a comunicação e a resolução de pendências nas tarefas.

## What Changes

- Implementar busca de usuários ao digitar "@" no campo de comentário (mentions).
- Ao salvar um comentário contendo menções, criar um registro de notificação (in-app) para cada usuário referenciado.
- Enviar um e-mail transacional (usando o sistema de e-mails atual, via Supabase/Resend) notificando o usuário que ele foi mencionado em um comentário.

## Capabilities

### New Capabilities
- `user-mentions`: Capacidade de pesquisar e selecionar usuários dentro do campo de comentário.
- `mention-notifications`: Geração de notificações no sistema (in-app) e por e-mail para usuários mencionados.

### Modified Capabilities
- `task-interactions`: Melhorar o componente de comentários para suportar *rich text* ou um *mention input*.

## Impact

- **UI**: O campo de texto para comentários será aprimorado para suportar um dropdown/autocomplete de usuários ao digitar `@`.
- **Backend/DB**: Atualização/criação de uma Edge Function ou RPC no Supabase para processar o texto do comentário salvo, identificar os IDs dos usuários mencionados, criar as entradas em `notifications` e disparar os e-mails via serviço externo.
