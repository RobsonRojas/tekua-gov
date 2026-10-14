## Why

Na reunião de 12/09/2026, foi levantada a necessidade de enviar imagens (evidência/comprovação) para concluir uma tarefa. Esse passo obrigatório torna o processo burocrático e desestimula o uso do sistema. A evidência é útil, mas não deveria ser pré-requisito para submeter uma tarefa à validação.

## What Changes

- Tornar a evidência (fotos/documentos) **opcional** ao concluir e enviar uma tarefa/demanda para validação: o executor passa a poder enviar sem anexos.
- Remover a trava do botão "Enviar Prova" que hoje impede o envio sem ao menos um arquivo, e deixar claro na interface que a evidência é opcional.
- Alinhar as specs afetadas (`task-execution` e `gift-economy-tasks`) para refletir que a evidência é opcional.

## Capabilities

### New Capabilities

### Modified Capabilities
- `task-execution`: o requisito "Task Progress Management" passa a permitir submeter a tarefa para validação **sem** evidência obrigatória (evidência opcional).
- `gift-economy-tasks`: o requisito "Economia Surreal e Provas" deixa de exigir prova georreferenciada (foto) para concluir a tarefa; a evidência passa a ser opcional.

## Impact

- Frontend: `src/pages/SubmitTaskProof.tsx` deixa de bloquear o envio sem anexos e passa a indicar evidência como opcional.
- Backend: sem mudanças obrigatórias — `submitProof` (`supabase/functions/api-work/index.ts`) já aceita envio sem evidência e atualiza o status para `pending_validation`.
- Fora de escopo: o registro de contribuições (`RegisterWork` / spec `work-registration`), que possui fluxo e política de evidência próprios.
