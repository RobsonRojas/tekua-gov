## 1. Segurança de Banco de Dados

- [x] 1.1 Criar migração SQL para restringir a função `create_notification` (remover EXECUTE do papel `anon` e `authenticated`).
- [x] 1.2 Implementar trigger `tr_notify_on_comment` na tabela `topic_comments`.
- [x] 1.3 Implementar trigger `tr_notify_on_activity_update` na tabela `activities` para lidar com atribuição e confirmação.

## 2. Refatoração do Frontend

- [x] 2.1 Remover chamadas manuais a `create_notification` no componente `TopicDetail.tsx`.
- [x] 2.2 Remover chamadas manuais a `create_notification` no componente `ActivityCard.tsx`.
- [x] 2.3 Validar que as notificações continuam sendo geradas automaticamente através de testes manuais.

## 3. Validação e Testes

- [x] 3.1 Tentar chamar a RPC `create_notification` via console do navegador e verificar o bloqueio.
- [x] 3.2 Postar um comentário e verificar se o autor da pauta recebe a notificação.
- [x] 3.3 Assumir uma tarefa e verificar se o solicitante recebe a notificação.
