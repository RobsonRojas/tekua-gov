## 1. Backend Edge Function Updates

- [x] 1.1 Em `supabase/functions/api-wallet/index.ts`, importar ou garantir que `supabaseAdmin` está disponível para chamar a criação de notificações.
- [x] 1.2 No bloco `case 'transfer':`, logo após `perform_transfer` retornar sucesso, adicionar um bloco `try-catch` para inserir uma notificação.
- [x] 1.3 Utilizar `supabaseAdmin.rpc('create_notification', ...)` ou `supabaseAdmin.from('notifications').insert(...)` para enviar a notificação ao `targetId`.
- [x] 1.4 A notificação deve incluir no título (JSONB) algo como `{"pt": "Transferência Recebida"}` e no `message` o `amount` recebido (e o remetente, usando os dados que já existem na sessão).

## 2. Testing and Validation

- [x] 2.1 Testar manualmente a funcionalidade executando o frontend e realizando uma transferência.
- [x] 2.2 Verificar no header (ícone do sino) do usuário de destino se a notificação aparece instantaneamente e possui o título e mensagem corretos.
