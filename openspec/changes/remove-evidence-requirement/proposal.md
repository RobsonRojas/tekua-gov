## Why

Hoje o ciclo de vida de uma tarefa/demanda ainda carrega a premissa de que a comprovação material é parte obrigatória do processo: a spec `work-registration` ainda descreve a "Obrigatoriedade de evidência" (o sistema bloqueia o registro de uma contribuição sem anexo), a conclusão de tarefa só acontece através de uma página dedicada a "Enviar Prova" e a interface sugere que uma prova é esperada. Esse fluxo é burocrático, desmotiva a participação e contraria o desenho do próprio sistema, que já possui validação social (`community_consensus`) e aprovação do requisitante (`requester_approval`) como mecanismos de checagem.

O Portal Tekuá deve funcionar sobre o **princípio de confiança mútua**: a declaração honesta do executor, combinada com a validação posterior pelos pares (ou pelo requisitante) e com a rastreabilidade de auditoria já existente, é suficiente. A evidência deixa de ser pré-requisito e passa a ser um recurso **opcional e complementar**, disponível para quem quiser registrar um contexto adicional — nunca um portão.

## What Changes

- **Remover a obrigatoriedade de evidência no registro de contribuições**: `RegisterWork` passa a permitir o registro de trabalho com zero anexos e sem foto; a spec `work-registration` deixa de exigir prova de trabalho.
- **Declarar, em nível de spec, que a evidência nunca condiciona a validação**: a confirmação (`requester_approval` ou `community_consensus`) passa a ocorrer sobre a declaração do executor, independentemente da existência ou não de anexos; ausência de evidência não gera bloqueio, erro ou penalidade em nenhum fluxo.
- **Eliminar o atrito da conclusão**: o executor passa a poder concluir a tarefa em um único passo (ação direta no Mural de Trabalho e botão "Concluir Tarefa" no detalhe da tarefa), com a evidência como *add-on* opcional posterior, em vez de ser obrigado a passar por uma etapa separada de "Enviar Prova".
- **Reformular a linguagem da interface**: "Enviar Prova" passa a "Concluir Tarefa"; a seção de evidências é rotulada como opcional e acompanhada de um aviso explícito de confiança mútua (`pt`/`en`).
- **Endurecer a conclusão como ato do executor**: a conclusão da tarefa passa a ser validada no backend contra o executor (ou administrador), impedindo que terceiros empurrem uma atividade para validação — requisito indispensável para que a confiança mútua seja também responsável.
- **Higienizar o dado de evidência**: `submit_activity` deixa de gravar registro em `activity_evidence` quando a evidência é ausente (evita linhas vazias que treated como "evidência" na leitura do mural).

## Capabilities

### New Capabilities

- `trust-based-validation`: Princípio de confiança mútua no ciclo de tarefas e demandas — a evidência é sempre opcional, jamais bloqueia a conclusão nem a validação, e a interface comunica essa postura de forma explícita.

### Modified Capabilities

- `work-registration`: o cenário "Obrigatoriedade de evidência" é removido — o registro de contribuição passa a admitir submissão sem nenhuma evidência, mantendo os demais validadores (descrição, valor positivo, categoria, executores).
- `community-validation`: a confirmação passa a se basear na declaração do executor e na confiança da comunidade/requisitante, com a evidência explicitamente fora do critério de decisão.
- `task-execution`: a conclusão da tarefa passa a ser possível em um único passo a partir do mural/detalhe, sem etapa obrigatória de prova, e a validação subsequente independe da existência de evidência.

## Impact

- **Frontend**: `src/pages/RegisterWork.tsx`, `src/pages/SubmitTaskProof.tsx` (semântica e copy), `src/pages/WorkWall.tsx` (conclusão direta), `src/pages/TaskDetail.tsx` (botão "Concluir Tarefa"), `src/locales/{pt,en}/translation.json` (novas chaves).
- **Backend**: `supabase/functions/api-work/index.ts` — `submitProof` (conclusão sem evidência + validação do ator) e `submitActivity` (sem `evidenceUrl` obrigatório).
- **Banco**: nova migração `supabase/migrations/` — `submit_activity` sem insert de `activity_evidence` quando a evidência é nula.
- **Testes**: `src/pages/RegisterWork.test.tsx`, testes de `WorkWall`/`TaskDetail` e testes de integração Supabase que assumem evidência obrigatória.
- **Fora de escopo (não é tarefa/demanda)**: o domínio de compartilhamento de equipamentos (`sharing-handover`, `equipment-sharing`) mantém a evidência de entrega, pois ali a prova do recebimento físico do item é parte do acordo de empréstimo, e não de uma validação de trabalho comunitário.
