## Context

Estado atual do ciclo de trabalho (tarefas/demandas/contribuições) no Portal Tekuá:

- `RegisterWork` cria uma **contribuição** (trabalho já executado) via `api-work → submitActivity → RPC submit_activity`. A spec `work-registration` ainda descreve a "Obrigatoriedade de evidência", embora o frontend já não bloqueie a submissão sem anexos.
- O executor de uma **tarefa** em execução conclui o trabalho pela página `/tasks/:id/submit` (`SubmitTaskProof`), que chama `api-work → submitProof` e move a atividade para `pending_validation`. O botão nos cards (`ActivityCard`) e no detalhe (`TaskDetail`) chama essa rota — "Concluir e Enviar".
- No Mural de Trabalho (`WorkWall`), arrastar um card de "Em Execução" para "Para Validar" redireciona para a mesma página de prova (`navigate('/tasks/:id/submit')`).
- A validação é feita pelo RPC `confirm_activity`: `requester_approval` (requisitante ou admin) ou `community_consensus` (N confirmações, `min_confirmations` com default 1). O pagamento em Surreais acontece dentro do próprio RPC.
- A evidência é gravada em `activity_evidence` (registro legado) e `activity_attachments` (com `is_evidence = true`), e exibida no visualizador seguro (modal).
- O `api-work` roda com a *anon key* + header `Authorization` do usuário (RLS ativa) e um client `supabaseAdmin` (service role) para operações administrativas. A RLS de `activities` (UPDATE) já restringe a escrita a `requester_id`, `worker_id`, `executors` do array ou conselho/admin.

Restrições relevantes: React 19 + Vite + MUI + TypeScript no frontend; Deno Edge Functions no backend; specs OpenSpec em `openspec/specs/` são a fonte de verdade do comportamento; o projeto tem specs de i18n (`pt`/`en`) com chaves em `src/locales/`.

Ver `proposal.md` para a motivação e `specs/` para os requisitos.

## Goals / Non-Goals

**Goals:**

- Nenhum caminho do ciclo de vida de tarefa/demanda pode ser bloqueado por ausência de evidência.
- Conclusão da tarefa em um passo, com evidência como *add-on* opcional (antes ou depois da conclusão).
- Conclusão validada como ato do executor (ou admin), com transição de estado bem delimitada.
- Copy da interface coerente com a postura de confiança mútua, em `pt` e `en`.
- Especificações (`work-registration`, `community-validation`, `task-execution`) e nova capability `trust-based-validation` refletindo o comportamento real.

**Non-Goals:**

- Não alterar o desenho da validação (`requester_approval` vs `community_consensus`), o quórum (`min_confirmations`) ou o modelo de pagamento/ledger.
- Não remover a feature de evidência: captura com marca d'água, upload, storage `task-evidence` e o visualizador seguro continuam existindo — apenas deixam de ser pré-requisito.
- Não tocar no domínio de compartilhamento de equipamentos (`sharing-handover`, `equipment-sharing`), onde a evidência de entrega do item físico faz parte do acordo de empréstimo.
- Não criar auditoria/anti-fraude nova: o rastreamento existente (audit log de atividades, `activity_confirmations`, ledger) é reutilizado.

## Decisions

### D1 — "Concluir" é uma transição de estado explícita, não "enviar prova"

O `api-work` ganha uma ação semântica de conclusão, mantendo `submitProof` como alias retrocompatível (o client e a fila offline já o referenciam). A conclusão:

1. valida o ator (executor da atividade ou administrador);
2. valida o estado de origem (`in_progress`);
3. grava as evidências anexadas (se houver);
4. move a atividade para `pending_validation`.

**Alternativas consideradas:** (a) reutilizar `updateActivity` para mudar o status — rejeitado, pois `updateActivity` é o caminho de edição do requisitante e tem semântica de edição de metadados; (b) criar um RPC `complete_activity` no banco — considerado, mas o `submitProof` já faz exatamente o necessário via RLS e trigrs de notificação/auditoria; adicionar um RPC duplicaria a lógica de transições por um ganho pequeno.

### D2 — Evidência posterior à conclusão via ação dedicada `addEvidence`

Para permitir anexar evidência depois de concluída (sem reverter o status), o `api-work` recebe uma ação `addEvidence` que **apenas** grava evidência/anexos, sem tocar em `status`. Sem ela, o executor que concluiu sem evidência ficaria sem caminho para registrá-la.

**Alternativa considerada:** reusar `submitProof` e proteger a transição por status — rejeitado, porque a semântica de "concluir" e "anexar evidência" são distintas e misturá-las reintroduz a dependência implícita entre evidência e estado.

### D3 — Conclusão em um passo no Mural e no detalhe da tarefa

- `WorkWall.handleDropCard` (`in_progress → pending_validation`): chama a ação de conclusão direto, com snackbar de sucesso e `refetch()` — sem navegar para a página de prova.
- `TaskDetail`: o botão principal passa a **"Concluir Tarefa"** e conclui direto; um botão secundário **"Anexar evidência (opcional)"** abre a rota `/tasks/:id/submit` (repurificada como "Concluir com evidência opcional").
- `ActivityCard`: o botão "Concluir e Enviar" passa a "Concluir Tarefa" e conclui direto; a evidência pode ser anexada depois pelo detalhe.
- `SubmitTaskProof` é **mantida** (não removida) e repurposeada: título "Concluir Tarefa", texto de confiança mútua, botão "Concluir Tarefa", evidência e GPS opcionais.

**Alternativas consideradas:** (a) remover a rota `/tasks/:id/submit` — rejeitado, ela concentra captura de GPS, upload e é o único ponto já preparado para anexar evidência com(location); (b) manter a navegação obrigatória para a página de prova — rejeitado, é exatamente o atrito burocrático que a mudança visa remover.

### D4 — Nenhum registro de evidência vazio

A RPC `submit_activity` passa a inserir em `activity_evidence` **somente** quando `p_evidence_url` for não-nulo. Hoje ela grava uma linha com `evidence_url = NULL` para toda contribuição sem evidência, o que polui a leitura do mural (e induz a UI a exibir "evidências" vazias).

**Alternativas consideradas:** (a) filtrar na leitura (`.not('evidence_url', 'is', null)`) — rejeitado, deixa o dado sujo no banco e em cada consulta; (b) tornar `evidence_url` NOT NULL e diferenciar linhas — rejeitado, complica migração sem ganho funcional.

### D5 — Autorização da conclusão no backend, não só na UI

Como a conclusão passa a ser um botão de um clique, a checagem de "quem pode concluir" precisa ser explícita no backend: a ação de conclusão exige que o ator esteja em `executor_ids`/`worker_id` da atividade **ou** seja administrador. O `confirm_activity` (RPC) já recusa o auto-confirm do executor, e a RLS de `activities` já limita as escritas — mas o `submitProof` hoje **não verifica o ator nem o estado de origem**, o que permitiria a um terceiro empurrar uma atividade para `pending_validation`.

**Alternativas consideradas:** (a) confiar apenas na RLS — insuficiente, a RLS permite `requester_id` e conselho/admin, mais amplo que "quem executa"; (b) mover a checagem para um trigger do banco — rejeitado,加重 o custo de escrita e não é testável no frontend sem duplicar a regra.

### D6 — Confiança mútua como copy explícita, não como ausência de regra

Nenhum requisito novo de segurança é criado; em vez disso, a interface passa a **dizer** o que o sistema garante: a seção de evidências é rotulada como opcional e um aviso explica que a conclusão se apoia na confiança mútua e na validação posterior pelos pares/requisitante. Chaves novas em `src/locales/pt|en/translation.json` (o projeto mantém i18n obrigatório).

**Alternativas consideradas:** remover completamente o bloco de evidências do formulário — rejeitado, removeria a capacidade (ainda útil e desejada por parte dos membros) e quebraria a spec `evidence-capture`.

## Risks / Trade-offs

- **[Risco] Aumento de trabalho sem prova real (free-riding/fraude)** → Mitigação: a conclusão não paga nada; o pagamento depende de `confirm_activity` (aprovação do requisitante ou N confirmações da comunidade) e a atividade concluída sem evidência fica visível e auditável. O `min_confirmations` e o `requester_approval` continuam sendo o contrapeso.
- **[Risco] Regressão: conclusão fora do estado esperado** → Mitigação: a ação de conclusão valida o estado de origem (`in_progress`) e rejeita transições inválidas; testes unitários cobrem executor, terceiro e admin.
- **[Risco] Inconsistência de i18n (strings hardcoded em pt na página de prova)** → Mitigação: as strings da página de prova são migradas para chaves `pt`/`en` nesta change.
- **[Trade-off] Evidência deixa de ser "prova" e passa a ser "contexto"** → Aceito: a rastreabilidade continua via log de atividades, `activity_confirmations` e ledger; o visualizador seguro permanece disponível.
- **[Risco] Código legado (`ContributionCard` usa `confirm_contribution` RPC)** → Mitigação: verificado que `confirm_contribution` não exige evidência; a change não altera esse fluxo, apenas a evidenciação nos requisitos.

## Migration Plan

1. **Banco** — nova migração `supabase/migrations/<timestamp>_submit_activity_optional_evidence.sql`: recria `submit_activity` com o insert em `activity_evidence` condicionado a `p_evidence_url IS NOT NULL` (mesma assinatura de 11 parâmetros da migração `20261016000000_remove_moderation_flow.sql`, para não quebrar chamadores). Idempotente e reversível: basta recriar a função anterior.
2. **Backend** — deploy da Edge Function `api-work` com as ações de conclusão e `addEvidence` e a checagem de ator/estado.
3. **Frontend** — deploy das telas (`RegisterWork`, `SubmitTaskProof`, `WorkWall`, `TaskDetail`, `ActivityCard`) e das chaves de i18n.
4. **Rollback** — reverter o deploy do frontend e da Edge Function e reaplicar a função `submit_activity` antiga; nenhum dado existente é destruído (apenas linhas `activity_evidence` com `evidence_url` NULL deixa de ser criada).

## Open Questions

- Devemos, em uma change futura, migrar as linhas legadas de `activity_evidence` com `evidence_url IS NULL` para uma tabela de histórico declarada? (Não bloqueia esta change: são linhas inertes.)
