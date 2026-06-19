## Why

Atualmente, tarefas configuradas com `requester_approval` (aprovação apenas pelo beneficiário) não podem ser confirmadas por outras pessoas. Isso tem causado entraves quando o beneficiário está ausente ou incapaz de confirmar. O administrador da plataforma precisa de privilégios para confirmar qualquer tarefa do mural, garantindo que o fluxo de trabalho não seja interrompido.

## What Changes

- Permitir que usuários com perfil de `admin` da plataforma confirmem tarefas independentemente do método de validação (`community_consensus` ou `requester_approval`).
- Atualizar as regras de autorização no frontend e backend (RPC) para garantir que administradores possuam bypass na restrição de `requester_approval`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `community-validation`: Atualizar a regra de confirmação para permitir que o administrador confirme qualquer atividade, inclusive aquelas exclusivas do `requester_id`.

## Impact

- Banco de dados: A RPC `confirm_activity` (ou as políticas RLS) precisarão ser ajustadas para reconhecer o privilégio de administrador.
- Frontend: Os botões de confirmação no mural de trabalho devem estar habilitados para administradores, mesmo em tarefas `requester_approval` onde o admin não seja o `requester_id`.
