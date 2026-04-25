## Why

A política de carência de 24 horas fixa para todos os payouts e a auditoria puramente passiva limitam a segurança da plataforma em cenários de alto risco. Para escalar, a Tekua precisa de flexibilidade para ajustar períodos de bloqueio baseados no risco e permitir auditorias humanas explícitas para ações críticas.

## What Changes

- **Período de Carência Variável**: Substituição do intervalo fixo de 24h por uma configuração baseada no tipo de atividade ou valor.
- **Auditoria Humana Mandatória**: Introdução de uma flag que impede a liberação automática de fundos até que um administrador revise e aprove a ação.
- **Status de Governança**: Novo ciclo de vida para payouts: `locked` -> `pending_audit` (se aplicável) -> `released`.

## Capabilities

### New Capabilities
- `governance-policy-engine`: Motor de regras para definir períodos de carência e requisitos de auditoria por categoria.
- `manual-audit-workflow`: Interface e lógica para administradores revisarem e liberarem payouts marcados para auditoria manual.

### Modified Capabilities
- `payout-lock-policy`: A regra de carência deixa de ser fixa e passa a consultar o motor de políticas.

## Impact

- **Database**: Nova tabela `governance_policies` para armazenar regras; atualização da tabela `activities` ou `payouts` para incluir flags de auditoria.
- **Frontend**: Nova visão de "Auditoria de Payouts" no painel administrativo; indicadores visuais de "Pendente de Auditoria" para o usuário.
- **Backend**: Atualização dos triggers de banco de dados que gerenciam `available_at`.
