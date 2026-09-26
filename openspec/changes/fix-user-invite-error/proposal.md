## Why

Users are experiencing an issue where inviting a new member via the administration panel results in an error (`AuthApiError: Error sending invite email`). As a result, the user seems to be created but does not appear in the member list, or the invitation flow is left in an inconsistent state. Fixing this is crucial for the member onboarding process.

## What Changes

- O cadastro de novos usuários não deve falhar caso o servidor de email (SMTP) apresente erros.
- A edge function `api-members` será corrigida para garantir que o usuário seja criado e inserido corretamente no banco de dados (aparecendo no painel de administração).
- Em vez de interromper a criação do usuário, o email de convite deve ser enfileirado na tabela `email_queue` para envio posterior.

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
<!-- No requirement changes, pure bug fix. skip_specs: true will be set in .openspec.yaml -->

## Impact

- `api-members` Supabase edge function
- Member administration panel UI (if error handling is needed)
