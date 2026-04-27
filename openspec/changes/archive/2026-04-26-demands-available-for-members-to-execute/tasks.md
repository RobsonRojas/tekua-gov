## 1. Backend & API

- [x] 1.1 Estender a ação `fetchActivities` na Edge Function `api-work` para suportar filtros por `requester_id` e `worker_id`.
- [x] 1.2 Implementar a ação `claimTask` na `api-work` para permitir que membros assumam demandas abertas.
- [x] 1.3 Garantir que a ação de `claimTask` seja atômica e valide se o status ainda é 'open'.

## 2. Frontend & UI

- [x] 2.1 Refatorar `WorkWall.tsx` para substituir a lista linear por um sistema de abas (Tabs) por status.
- [x] 2.2 Criar o componente `WorkFilters.tsx` com seletores para demandante, executor e tipo de atividade.
- [x] 2.3 Implementar o botão "Assumir Tarefa" nos cartões de atividade com status 'open'.
- [x] 2.4 Adicionar feedback visual (loading/sucesso) ao assumir uma tarefa.

## 3. Localização (i18n)

- [x] 3.1 Adicionar traduções para os novos status das abas e labels de filtros em `pt.json` e `en.json`.

## 4. Testes e Verificação

- [x] 4.1 Validar se os filtros combinados funcionam corretamente no Mural de Trabalho.
- [x] 4.2 Testar a concorrência (via console/múltiplas abas) ao assumir a mesma tarefa por usuários diferentes.
