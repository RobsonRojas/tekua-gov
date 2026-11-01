## Why

Os procedimentos operacionais padrão (POPs) e protocolos da vila hoje não têm um lugar próprio: ficam em documentos soltos ou na memória de quem faz a tarefa. Quem cria ou executa uma tarefa ou demanda no mural não consegue apontar qual protocolo seguir, e quem executa não sabe onde encontrá-lo.

## What Changes

- Nova área na Governança para **criar, editar, arquivar e consultar protocolos/POPs**, cada um com título e texto em Markdown. Todo membro lê; somente administradores e membros do Conselho escrevem.
- Novo cartão "Protocolos e POPs" na página de serviços de Governança, que leva a essa área.
- Campo **opcional de pesquisa e seleção de um protocolo** nos formulários de criação de tarefa, criação de demanda e edição de tarefa/demanda do mural.
- O detalhe da tarefa ou demanda mostra o protocolo vinculado, com acesso ao texto completo.
- Protocolo arquivado continua visível nas atividades que já o usam, mas deixa de aparecer para seleção.

## Capabilities

### New Capabilities
- `governance-protocols`: cadastro, edição, arquivamento e consulta de protocolos/POPs na Governança.

### Modified Capabilities
- `work-registration`: criação e edição de tarefas e demandas ganham o campo opcional de protocolo.

## Impact

- **Banco:** nova tabela `governance_protocols` e coluna opcional `activities.protocol_id` (migration).
- **Backend:** `supabase/functions/api-governance/index.ts` (ações de protocolo) e `supabase/functions/api-work/index.ts` (`createActivity`, `updateActivity`, leitura).
- **Frontend:** nova página de protocolos, cartão em `GovernanceServices.tsx`, componente de seleção, `CreateTask.tsx`, `CreateDemand.tsx`, `TaskDetail.tsx`.
- **i18n:** novas chaves pt/en.
- Fora do escopo: o Registro de Trabalho (`RegisterWork.tsx`), que usa a função de banco `submit_activity`, e a seleção de vários protocolos.
