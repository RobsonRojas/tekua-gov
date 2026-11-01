## Context

`claimTask` recusa o solicitante, e os dois pontos de interface que mostram "Assumir Tarefa" (`TaskDetail`, `ActivityCard`) desabilitam o botão com `isOwner`. A regra de confirmação já admite que o solicitante seja também executor: em aprovação do solicitante ele pode confirmar (spec `community-validation`), e em confirmação pela comunidade, nenhum executor confirma o próprio trabalho.

## Goals / Non-Goals

**Goals:**
- O criador assume a própria tarefa aberta, sem ajuda de um administrador.

**Non-Goals:**
- Mudar quem confirma, ou o cálculo e o pagamento da recompensa.
- Aplicar a regra a demandas com executor definido (o fluxo delas não passa por "assumir").

## Decisions

### D1 – Remover a recusa no servidor e o `isOwner` do botão

**Escolha:** apagar a checagem de `requester_id` em `claimTask` e tirar `isOwner` do `disabled` dos dois botões. As demais condições permanecem: status `open`, tipo tarefa e atualização condicionada a `status = 'open'`, que impede dois assumirem a mesma tarefa.

**Rationale:** é a menor mudança que dá o comportamento pedido e mantém a proteção contra assumir duas vezes.

### D2 – Sem nova regra de confirmação

**Escolha:** não alterar as regras de confirmação. Em aprovação do solicitante, o criador que assumiu pode confirmar a própria execução, como já prevê `community-validation`; em confirmação pela comunidade, ele não confirma.

**Rationale:** a regra do solicitante-executor já foi decidida e especificada; esta mudança só abre o caminho que antes era bloqueado.

## Risks / Trade-offs

- **Autopagamento:** em tarefas de aprovação do solicitante, o criador pode criar, assumir, concluir e confirmar sozinho, e a recompensa é creditada a ele sem outro membro olhar. Antes isso exigia um segundo membro ou um administrador. → Aceito por pedido da vila; o histórico de ações da tarefa registra quem criou, assumiu e confirmou, e o administrador acompanha pelo painel. Se virar problema, a saída é exigir que a confirmação venha de outra pessoa quando criador e executor coincidem.
- **Mensagem de erro antiga em clientes desatualizados** → o botão deixa de ser habilitado só após a atualização do app; o servidor passa a aceitar de imediato.

## Open Questions

Nenhuma.
