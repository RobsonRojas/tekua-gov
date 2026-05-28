## Why

Foi reportado um bug crítico no módulo de gestão de membros (Member Management) onde, ao adicionar um novo membro ao sistema, o endereço de e-mail fornecido não está sendo salvo corretamente no banco de dados. Isso impede o funcionamento correto de convites, notificações e logins para o novo membro cadastrado.

## What Changes

- Correção no fluxo de submissão do formulário de adição de membros (backend/API ou frontend).
- Garantia de que o campo `email` seja mapeado, validado e inserido corretamente na tabela de membros (`users` ou `profiles`).

## Capabilities

### New Capabilities

### Modified Capabilities
- `member-management`: Atualização e correção no fluxo de cadastro de membros para garantir a integridade dos dados de contato (e-mail).

## Impact

- **Frontend**: Revisão no componente de formulário (ex: `AddMemberForm`) para garantir que o estado do campo e-mail está sendo enviado no payload da requisição.
- **Backend/Supabase**: Revisão na função RPC ou Edge Function (ex: `add_member` ou script de invite) responsável por receber os dados do frontend e inseri-los no banco, certificando-se de que a coluna de email não está sendo ignorada.
