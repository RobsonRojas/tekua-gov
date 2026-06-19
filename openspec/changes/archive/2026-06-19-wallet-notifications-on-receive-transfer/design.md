## Context

O sistema atual de carteira transfere moedas Surreais via Edge Function (`api-wallet`) acionando o RPC `perform_transfer`. Atualmente, essa operação não notifica o usuário destino. Com o hub de notificações implementado na plataforma (`notifications` table / `create_notification` function), queremos avisar o destinatário que ele recebeu fundos.

## Goals / Non-Goals

**Goals:**
- Notificar o usuário recebedor sobre transferências de Surreais concluídas com sucesso.
- A notificação deve aparecer no Hub de Notificações in-app (ícone do sino) em tempo real (pois a tabela `notifications` possui realtime habilitado).
- Incluir no alerta a quantia recebida.

**Non-Goals:**
- Notificações de email (out-of-scope para este PR, a menos que a engine de email já intercepte inserções de notificação de carteira).
- Notificações para o remetente (o remetente já tem feedback visual na tela de sucesso ao concluir o modal).

## Decisions

- **Onde emitir a notificação**: Na Edge Function `api-wallet`, logo após o retorno de sucesso do RPC `perform_transfer`.
  - *Rationale*: A Edge Function tem o contexto completo da transação (incluindo o ID do destinatário e do remetente). Fazer via trigger no banco de dados (`transactions` ou `ledger_entries`) adicionaria complexidade de string localization no banco e exigiria junções com a tabela `profiles` para obter nomes, o que no TypeScript/Edge Function é mais simples e explícito.
- **Inserção Direta ou Notify-Engine**: Vamos inserir diretamente chamando a função RPC `create_notification` (ou inserção na tabela `notifications`) através do `supabaseAdmin` na Edge Function `api-wallet`.
  - *Rationale*: `create_notification` já existe na migração `20260410000005_notifications_hub.sql` e a Edge Function tem permissões administrativas para inserir a notificação para o usuário alvo.
- **Estrutura da Notificação**:
  - `type`: `'finance'`
  - `title`: `{"pt": "Transferência Recebida", "en": "Transfer Received"}`
  - `message`: `{"pt": "Você recebeu $S <amount> de <sender_name_or_email>", "en": "You received $S <amount> from <sender_name_or_email>"}`
  - `link`: `"/wallet"`

## Risks / Trade-offs

- **[Risco]** Falha na inserção da notificação quebrar o fluxo da transferência.
  - **Mitigação**: O envio da notificação na Edge Function deve ser envolto num bloco `try-catch` sem re-throw de erro para o frontend. Se a notificação falhar, o log registra o erro, mas o usuário remetente ainda vê "Sucesso" pois a transferência (RPC) já ocorreu.
