## Context

Ver `proposal.md` — Why. Estado atual que condiciona a abordagem:

- `confirm_activity` (migração `20261021000000_remove_pending_approval_from_activity_status.sql`, `SECURITY DEFINER`) verifica, antes de qualquer ramo por `validation_method`, se o usuário é `worker_id` ou está em `executor_ids` e levanta "You cannot confirm your own work". Essa guarda protege o método `community_consensus`, em que nenhum solicitante existe.
- Em `requester_approval`, o ramo seguinte já aceita apenas `requester_id` ou administrador, e registra a confirmação, conclui a atividade e paga cada executor.
- `TaskDetail.tsx` calcula `isWorker` (worker ou executor) e `isOwner` (`requester_id`). O `canConfirm` já usa `isOwner`, mas o `disabled` do botão usa só `isWorker`.
- `requester_id` só é preenchido quando a atividade é `requester_approval` (`api-work` deriva o método a partir da presença de `requesterId`). Portanto, quando `requester_id` existe, o método é sempre `requester_approval`.

## Goals / Non-Goals

**Goals:**
- Permitir que o solicitante confirme a atividade mesmo quando também é executor, em `requester_approval`.
- Manter a proibição de autoconfirmação para executores que não são o solicitante, em todos os métodos.
- Corrigir backend e frontend de forma consistente, para o botão e a RPC concordarem.

**Non-Goals:**
- Não alterar `community_consensus`: administrador que também é executor continua bloqueado nesse método.
- Não alterar o pagamento, a contagem de confirmações nem o fluxo de submissão de evidências.
- Não alterar `community_consensus`.

## Decisions

**1. Exceção à guarda de autoconfirmação somente para o solicitante.**
- *Decisão:* na RPC, a guarda passa a ser `(worker_id ou executor) AND user IS DISTINCT FROM requester_id AND NOT (is_admin AND método = requester_approval)`. Quando não há solicitante (`community_consensus`), a comparação continua verdadeira e a guarda permanece. A exceção de administrador segue a spec `community-validation`, que lhe dá permissão de confirmar em `requester_approval`.
- *Por quê:* a exceção fica restrita ao único caso previsto na spec (beneficiário indicado). `IS DISTINCT FROM` trata o `NULL` do método por consenso sem precisar de ramo extra.
- *Alternativa rejeitada:* remover a guarda inteira da RPC. Quebraria a proteção do método `community_consensus`, em que um executor poderia votar no próprio trabalho.
- *Alternativa rejeitada:* ignorar a verificação só no frontend. A RPC continuaria rejeitando, e o botão habilitado gerava erro.

**2. Frontend: desabilitar por executor que não é solicitante.**
- *Decisão:* `disabled={actionLoading || (isWorker && !isOwner) || activity.user_has_confirmed}`.
- *Por quê:* reaproveita `isOwner` já calculado e mantém a regra do `canConfirm` (que já trata solicitante e admin). O botão de admin forçando (`isAdminForcing`) não muda, porque admin não é `isOwner`.

**3. Migração com `CREATE OR REPLACE` da função inteira.**
- *Decisão:* nova migração que recria `public.confirm_activity(UUID)` com o mesmo corpo da versão atual, alterando só a guarda. Mesma assinatura, `SECURITY DEFINER` e tipo de retorno, para não quebrar chamadas da `api-work`.
- *Alternativa:* `ALTER FUNCTION` ou patch parcial. Não existe no Postgres para mudar um trecho do corpo, então recriar é o caminho.

## Risks / Trade-offs

- **Autopagamento por solicitante-executor** → o solicitante já define a recompensa e a spec já lhe dá o poder de aprovar em `requester_approval`. A exceção só vale para esse método. Vale confirmar com o responsável pelo produto que essa é a regra desejada, porque o solicitante que também executa passa a aprovar o próprio pagamento.
- **Divergência entre botão e RPC** → mitigado alterando as duas camadas no mesmo change e com testes cobrindo a regra nos dois lados.
- **Migração em produção sem ambiente de homologação intermediário** → a mudança é restrita à guarda; o restante do corpo é cópia literal da versão atual, validada por diff antes de aplicar.

## Migration Plan

1. Aplicar a migração no projeto Supabase de produção (`rhpcenqbelifilylwujy`) **antes** do frontend, para que o botão habilitado nunca dispare a rejeição antiga.
2. Publicar o frontend (`TaskDetail.tsx`).
3. **Rollback:** reaplicar a definição de `confirm_activity` da migração `20261021000000_remove_pending_approval_from_activity_status.sql` e reverter o commit do frontend. Não há migração de dados.

## Open Questions

Nenhuma em aberto. A pergunta sobre administrador-executor foi decidida pela spec: em `requester_approval` o administrador pode confirmar; em `community_consensus` continua bloqueado (ver tarefa 4.5).