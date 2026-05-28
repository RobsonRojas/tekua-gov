## Why

Atualmente, o sistema de registro de trabalhos assume que quem está registrando o trabalho é a mesma pessoa que o realizou (ou que está solicitando em seu nome). É necessário permitir que um membro registre o trabalho em nome de outra pessoa, selecionando explicitamente quem foi o executor da tarefa. Isso é útil para situações onde um membro não tem acesso imediato ao sistema, mas o trabalho precisa ser contabilizado e recompensado.

## What Changes

- Inclusão de um campo de seleção de "Membro Executor" no formulário de registro de trabalho.
- O backend deverá registrar a atividade vinculando-a ao membro selecionado como autor/executor, ao invés de forçar que o autor seja o usuário logado.
- Garantia de que as notificações e fluxos de validação reflitam corretamente quem realizou a tarefa.

## Capabilities

### New Capabilities

### Modified Capabilities
- `work-registration`: Modificação no processo de submissão para aceitar a indicação de um executor diferente do usuário que está preenchendo o formulário.

## Impact

- **Frontend**: Modificação no formulário de registro de trabalho (ex: `WorkRegistrationForm` ou equivalente) para incluir um componente de busca/seleção de membros (Select/Dropdown).
- **Backend/API**: Atualização na Edge Function `api-work` ou RPC de inserção para processar e associar o ID do membro executor (author_id) de forma segura, garantindo que a recompensa e validação sejam direcionadas à pessoa correta.
