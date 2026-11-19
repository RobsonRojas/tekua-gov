## Context

Em `src/pages/TaskDetail.tsx` o botão de confirmação é renderizado quando `status === 'pending_validation' && canConfirm` e desabilitado por: `actionLoading`, `isWorker && !isSelfConfirmExempt` ou `activity.user_has_confirmed`. Hoje nada explica o motivo ao usuário. Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Derivar a lista de requisitos das mesmas condições que desabilitam o botão, sem duplicar a lógica.
- Textos intuitivos em pt/en.

**Non-Goals:**
- Alterar quem pode confirmar ou a RPC `confirm_activity`.
- Explicar por que o botão está oculto (usuário sem permissão de confirmar): fora do escopo; a lista só acompanha o botão desabilitado.

## Decisions

- **Função pura de requisitos**: criar `getConfirmRequirements(...)` (ex.: em `src/utils/` ou junto ao componente) que recebe `isWorker`, `isSelfConfirmExempt`, `user_has_confirmed` e devolve `{ key, met }[]`. O `disabled` do botão passa a ser `actionLoading || requirements.some(r => !r.met)`, garantindo que lista e botão nunca divirjam. Alternativa descartada: texto fixo por caso, que poderia sair de sincronia com o `disabled`.
- **Requisitos**:
  1. "Você não executou esta tarefa" (ou ser solicitante/admin que pode confirmar o próprio trabalho): não satisfeito se `isWorker && !isSelfConfirmExempt`.
  2. "Você ainda não confirmou": não satisfeito se `user_has_confirmed`.
  Redação voltada à ação, ex.: "Outra pessoa que não executou a tarefa precisa confirmar".
- **`actionLoading`** não é um requisito: é estado transitório e não aparece na lista.
- **Componente**: pequeno `ConfirmRequirementsList` com `List` do MUI, ícone check (satisfeito) ou aviso/círculo (pendente), usando `aria-live` não necessário; texto acessível por ícones com `aria-label`.
- **i18n**: novas chaves em `work.confirmRequirements.*` nos dois idiomas, com fallback em português como o restante do arquivo.

## Risks / Trade-offs

- [Novas condições de bloqueio adicionadas depois sem entrada na lista] → o `disabled` deriva da lista, então toda nova regra precisa virar requisito.
- [Lista com um só requisito parece redundante] → aceitável; a clareza do motivo importa mais.
