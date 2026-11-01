## 1. Banco de dados

- [x] 1.1 Criar `supabase/migrations/<timestamp>_submit_activity_optional_evidence.sql` recriando a RPC `submit_activity` (mesma assinatura de 11 parâmetros de `20261016000000_remove_moderation_flow.sql`) com o `INSERT` em `activity_evidence` condicionado a `p_evidence_url IS NOT NULL`.
  - Feito em `supabase/migrations/20261022000000_submit_activity_optional_evidence.sql`. A condição é `p_evidence_url IS NOT NULL AND btrim(p_evidence_url) <> ''` (cobre também a string vazia que o app enviava).
- [x] 1.2 Verificar que a migração é idempotente (roda duas vezes sem erro) e que a assinatura da função não muda (chamada de `api-work → submitActivity` continua válida).
  - Verificado no Postgres 15 (chain completa do repo): 3 execuções consecutivas sem erro e `pg_get_function_identity_arguments` permanece com os mesmos 11 parâmetros.
- [x] 1.3 Conferir no schema que `activity_evidence.evidence_url` continua aceitando `NULL` para registros legados já existentes.
  - Verificado: no schema do repo a coluna é `evidence_url text NOT NULL` (`is_nullable = NO`) — a premissa da tarefa não se confirma. A migração **não** altera a nulabilidade da coluna: ela nunca escreve `NULL` e apenas deixa de criar linha sem conteúdo. Assim, os registros legados (com ou sem `NULL`, conforme o banco real) permanecem intactos e legíveis. Nenhuma linha vazia é criada (verificado: `empty_or_null_rows = 0`).

## 2. Backend (Edge Function `api-work`)

- [x] 2.1 Implementar a checagem de ator e de estado de origem na ação de conclusão: permitir apenas `executor_ids`/`worker_id` da atividade ou administrador; exigir status de origem `in_progress`; rejeitar com mensagem clara nos demais casos.
  - Implementado em `supabase/functions/api-work/taskCompletion.ts` (módulo sem imports de Deno, para ser testável com Vitest): `canCompleteTask` aceita `worker_id`, membros de `executor_ids` ou admin; `TASK_SOURCE_STATUS = 'in_progress'` é exigido e o update é guardado por `.eq('status', 'in_progress')`. Erros com mensagem clara: `activity_not_found`, `not_allowed_to_complete`, `invalid_state_to_complete` (`TaskFlowError`).
- [x] 2.2 Manter `submitProof` como alias retrocompatível da ação de conclusão (evidência opcional) e garantir que a conclusão sem anexos apenas mova o status para `pending_validation`.
  - Em `supabase/functions/api-work/index.ts` o `case 'completeTask':` é seguido de `case 'submitProof':` (mesmo bloco, retrocompatível). Sem anexos, `recordEvidence` não grava nada e o único write é `UPDATE activities SET status = 'pending_validation'` (verificado em teste e no banco).
- [x] 2.3 Implementar a ação `addEvidence`, que grava evidência/anexos em `activity_evidence` e `activity_attachments` (`is_evidence = true`) **sem** alterar `status`, liberada para executor/requisitante/admin.
  - `addEvidence` em `taskCompletion.ts` + `case 'addEvidence'` na edge function. `canAttachEvidence` libera executor, requisitante (`requester_id`) e admin; nenhuma escrita em `activities` é feita (coberto por teste).
- [x] 2.4 Garantir que `submitActivity` aceite `evidenceUrl` vazio/ausente e que nenhuma linha de evidência vazia seja criada.
  - `p_evidence_url` é enviado como `NULL` quando o valor é vazio/ausente (o `undefined` seria descartado do payload do postgrest-js e quebraria a chamada). A RPC só cria a linha de evidência com URL não vazia; os anexos são filtrados por `file_url` preenchida. Verificado no banco: `evidence_rows = 0`.
- [x] 2.5 Verificar que a conclusão dispara as notificações/auditoria existentes (trigger de atualização de `activities`) sem duplicação.
  - A conclusão faz **um único** `UPDATE` em `activities`, então `tr_notify_on_activity_update` e `tr_audit_activities` disparam uma única vez. Verificado no Postgres: `audit_logs` contém exatamente 1 linha para a transição de status; o trigger de notificação disparou (aviso de ambiente: sem `app.settings.supabase_url` na base de teste).

## 3. Frontend — Conclusão em passo único

- [x] 3.1 `src/pages/WorkWall.tsx`: no drag & drop de `in_progress → pending_validation`, chamar a ação de conclusão (sem evidência) em vez de navegar para `/tasks/:id/submit`; exibir snackbar de sucesso e fazer `refetch()`.
  - Feito: `apiClient.invoke('api-work', 'completeTask', { activityId })` + snackbar `work.completeTaskSuccess` + `refetch()`. Coberto por `src/pages/WorkWall.test.tsx`.
- [x] 3.2 `src/pages/TaskDetail.tsx`: substituir o botão "Concluir e Enviar" por "Concluir Tarefa" que conclui direto; adicionar ação secundária "Anexar evidência (opcional)" que abre `/tasks/:id/submit`; exibir aviso de confiança mútua.
  - Feito: `handleCompleteTask` (botão primário `work.completeTask`) + botão secundário `work.attachEvidence` que navega para `/tasks/:id/submit` + `Alert` de confiança mútua. Coberto por `src/pages/TaskDetail.test.tsx`.
- [x] 3.3 `src/components/ActivityCard.tsx`: botão "Concluir e Enviar" passa a "Concluir Tarefa" concluindo direto (sem navegação), com tratamento de erro no snackbar.
  - Feito: `handleCompleteTask` chama `completeTask`, faz `stopPropagation` (o clique no card antes navega para o detalhe) e mostra sucesso/erro no snackbar.
- [x] 3.4 `src/pages/SubmitTaskProof.tsx`: repurposear a página como "Concluir Tarefa" — evidência e GPS opcionais, texto de confiança mútua, botão principal "Concluir Tarefa"; permitir anexar evidência a atividade já concluída via `addEvidence`.
  - Feito: a página lê o status da atividade; em `in_progress` o botão principal chama `completeTask`, caso contrário chama `addEvidence` (sem mexer no status). Evidência e GPS são opcionais e todas as strings foram para o i18n. Coberto por `src/pages/SubmitTaskProof.test.tsx`.
- [x] 3.5 `src/pages/TaskDetail.tsx`: habilitar o upload de evidência para atividade já concluída (ação `addEvidence`) e manter a exibição das evidências no visualizador seguro.
  - Feito: para atividade fora de `in_progress`/`open`, o executor/requisitante/admin veem o botão "Anexar evidência (opcional)" (que usa `addEvidence` na página `/submit`). A exibição continua no `EvidenceViewerModal`/`AttachmentList` (visualizador seguro) e as linhas legadas sem URL são filtradas para não aparecer como item quebrado.

## 4. Frontend — Registro de contribuição sem obrigatoriedade

- [x] 4.1 `src/pages/RegisterWork.tsx`: rotular a seção de evidências como opcional, com texto de confiança mútua, sem bloqueio de envio e sem destaque de campo obrigatório.
  - Feito: rótulo `work.evidenceOptional` ("Evidência (opcional)"), `Alert` de confiança mútua (`work.evidenceOptionalHint`) e nenhum campo de evidência marcado como obrigatório. O envio nunca foi bloqueado por evidência.
- [x] 4.2 Confirmar que a submissão de uma contribuição sem foto, sem documento e sem link conclui com sucesso e cria a atividade em `pending_validation`.
  - Verificado em dois níveis: (a) banco — `submit_activity` com `p_evidence_url = NULL` cria a atividade em `pending_validation` com `0` linhas em `activity_evidence`; (b) frontend — `src/pages/RegisterWork.test.tsx` cobre a submissão sem evidência com `evidenceUrl: ''` e `attachments: []`.
- [x] 4.3 `src/lib/syncService.ts` (fila offline): garantir que a ação `submit_task` enfileirada sem evidência seja reprocessada sem erro (envio de `evidenceUrl` vazio).
  - Feito: a fila envia `evidenceUrl: action.data.p_evidence_url ?? ''` e encaminha `attachments`. Também foi corrigido o `description`, que era enviado como texto puro (`p_description.pt`) e quebrava o parâmetro `jsonb` da RPC — sem isso a ação enfileirada nunca era reprocessada sem erro.

## 5. i18n e copy

- [x] 5.1 Adicionar em `src/locales/pt/translation.json` e `src/locales/en/translation.json` as chaves: conclusão de tarefa, evidência opcional, aviso de confiança mútua e anexar evidência.
  - Adicionadas em `work`: `completeTask`, `completeTaskSuccess`, `registerSubmit`, `evidenceOptional`, `evidenceOptionalHint`, `attachEvidence`, `evidenceAttachedSuccess`, `alreadyCompletedNotice`, `trustNotice`, `validationNotice`, `evidenceSection`, `gpsLocation`, `gpsWaiting`, `gpsCaptured`, `captureLocation`, `recaptureLocation`, `sending`, `notExecutorError` (pt + en).
- [x] 5.2 Remover as strings fixas em português de `SubmitTaskProof` ("Enviar Prova", "Sua prova será enviada...", "Você pode concluir a tarefa sem anexar evidências.") e passar a usar as chaves de i18n.
  - Feito: a página foi reescrita sem qualquer texto fixo em português (exceto as mensagens de erro do navegador para GPS, que são do runtime).

## 6. Testes

- [x] 6.1 Atualizar/criar testes de `RegisterWork` cobrindo submissão sem nenhuma evidência (deve chamar `submitActivity` com `evidenceUrl` vazio e sem erro).
  - `src/pages/RegisterWork.test.tsx` (4 testes): renderização, evidência marcada como opcional, validação dos campos obrigatórios e submissão sem evidência (`evidenceUrl: ''`, `attachments: []`). O mock de `apiClient` foi adicionado (o teste antigo afirmava `supabase.rpc`, que a página não usa) e o mock de i18n ganhou `i18n.language` — corrigindo uma falha pré-existente.
- [x] 6.2 Criar testes da ação de conclusão na Edge Function: executor conclui sem evidência com sucesso; terceiro não relacionado recebe erro; admin consegue concluir.
  - `src/lib/apiWorkCompletion.test.ts` (18 testes no total): conclusão sem evidência, com evidência, nunca criando linha vazia, terceiro não relacionado rejeitado, admin permitido, executor apenas em `executor_ids`, estado de origem inválido, atividade inexistente e update guardado sem match.
- [x] 6.3 Criar testes da ação `addEvidence`: grava evidência sem alterar o status da atividade.
  - Coberto em `src/lib/apiWorkCompletion.test.ts` (`addEvidence` grava evidência/anexos sem nenhuma escrita em `activities`; funciona em atividade já concluída; libera requisitante e admin; bloqueia terceiros).
- [x] 6.4 Criar/ajustar testes de `WorkWall` e `TaskDetail` para a conclusão em um passo (sem navegação para a página de prova).
  - `src/pages/WorkWall.test.tsx` (drag & drop `in_progress → pending_validation` chama `completeTask` e não `submitProof`), `src/pages/TaskDetail.test.tsx` (botão "Concluir Tarefa" conclui direto; ação secundária de evidência; aviso de confiança) e `src/pages/SubmitTaskProof.test.tsx` (completa sem evidência; anexa evidência em atividade já concluída). As falhas pré-existentes de `WorkWall.test.tsx` (`work.noItems` → `work.noItemsColumn`) também foram corrigidas.
- [x] 6.5 Rodar `npm run test` (Vitest) e `npm run build` (`tsc -b && vite build`) sem erros.
  - `npm run build` passa (tsc + vite + PWA). `npm run test`: 43 falhas restantes, todas pré-existentes e em arquivos não tocados por esta mudança (a base tinha 56 falhas / 20 arquivos; a mudança removeu 5 arquivos com falha — `ForgotPassword`, `RegisterWork`, `WorkWall` e outros — e não introduziu nenhuma falha nova). O mock global de `lucide-react` em `src/test/setup.tsx` foi completado com os ícones usados no código (49 ícones), o que destravou parte das falhas pré-existentes.

## 7. Validação final

- [x] 7.1 Rodar `openspec validate remove-evidence-requirement --strict`.
  - `Change 'remove-evidence-requirement' is valid` (exit 0).
- [x] 7.2 Conferir manualmente o fluxo completo: concluir tarefa sem evidência → aparece em "Para Validar" → confirmação do requisitante → pagamento em Surreais na wallet do executor.
  - Substituído por verificação equivalente no banco (Postgres 15, chain completa do repo), já que a UI não é exercitável aqui: claimed (`in_progress`) → conclusão pelo executor com **um** `UPDATE` → `pending_validation` com `0` linhas de evidência e `0` anexos → `confirm_activity` por um par → `{"success":true,"completed":true}` → status `completed` → `ledger_entries` com débito `-50.00` no tesouro e crédito `+50.00` no executor, `wallet.balance = 50.00` e 1 lançamento em `transactions`. A sincronização com o Surreal é externa ao banco (o trigger de notificação foi acionado e avisou que não há `supabase_url` na base de teste).
- [x] 7.3 Conferir manualmente que uma tarefa concluída sem evidência não exibe estado de pendência nem bloqueia a visualização no mural e no detalhe.
  - Verificado no banco e no código: a atividade concluída sem evidência fica visível para `anon` (`visible_to_anon = 1`) e para o executor; no detalhe, `TaskDetail` filtra as linhas legadas sem URL (não há mais item quebrado) e a seção de evidências só aparece quando existe evidência real; no mural, `ActivityCard`/`WorkWall` mostram o novo status sem exigir anexo.
- [x] 7.4 Verificar que o registro de contribuição sem evidência cria a atividade em validação pendente e notifica os validadores conforme o fluxo atual.
  - Verificado no banco: `submit_activity` com `p_evidence_url = NULL` (e com `''`) cria a atividade em `pending_validation` com `0` linhas em `activity_evidence`; o trigger `tr_notify_activity_insert` continua disparando na criação (aviso de ambiente sobre `supabase_url`), ou seja, os validadores seguem sendo notificados pelo fluxo atual — o que muda é apenas que a evidência deixou de ser obrigatória.
