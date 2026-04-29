## 1. Banco de Dados (Correção)

- [x] 1.1 Criar nova migração `20260428181000_fix_notification_trigger_robustness.sql`.
- [x] 1.2 Atualizar a função `handle_task_notification_event` para usar `current_setting(..., true)`.
- [x] 1.3 Adicionar lógica de verificação (Guard Clause) para evitar execução sem URL/Key.
- [x] 1.4 Adicionar `RAISE WARNING` para facilitar a depuração.

## 2. Configuração de Ambiente

- [x] 2.1 Criar um script SQL utilitário (ex: `set_notification_secrets.sql`) para o usuário aplicar suas chaves reais de forma persistente.

## 3. Verificação

- [x] 3.1 Tentar criar uma demanda SEM as chaves configuradas (deve ter sucesso na criação, com aviso no log).
- [x] 3.2 Configurar chaves fictícias e validar que o `net.http_post` é disparado (via logs do `pg_net`).
