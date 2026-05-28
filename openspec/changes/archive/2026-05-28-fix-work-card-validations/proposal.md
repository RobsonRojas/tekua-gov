## Why

O cartão de trabalho (demanda) atualmente não permite que o administrador edite o número de confirmações necessárias (validation threshold) diretamente. Além disso, há um bug crítico que impede os membros do conselho de confirmarem a realização do trabalho clicando no botão de confirmação, bloqueando o fluxo de aprovação e pagamento de recompensas.

## What Changes

- Permitir que administradores editem o campo de número de confirmações necessárias (threshold) diretamente no cartão de trabalho/demanda.
- Corrigir o botão de confirmação para os membros do conselho, garantindo que o clique registre a validação corretamente no banco de dados e atualize o status na interface.

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin-activity-management`: Atualização para permitir a edição do número de confirmações necessárias por parte do administrador.
- `community-validation`: Correção no fluxo de validação para permitir que membros do conselho consigam confirmar o trabalho.

## Impact

- **Frontend**: Atualização no componente do cartão de trabalho (`WorkCard` ou equivalente) para exibir o campo de edição do threshold para admins, e correção no manipulador de eventos (onClick) do botão de confirmação para membros do conselho.
- **Backend/RPC**: Possível correção nas funções RPC de validação (`confirm_activity`) ou nas políticas de RLS (Row Level Security) caso os membros do conselho estejam sendo bloqueados por falta de permissão ao tentar validar.
