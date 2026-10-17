## Why

A etapa de moderação adiciona uma aprovação intermediária que atrasa a publicação de tarefas e demandas na comunidade e cria uma coluna extra ("Moderação") que polui o Mural de Trabalho. O fluxo desejado é que todo trabalho criado fique visível imediatamente na coluna "Open", sem curadoria prévia do Conselho Transversal.

## What Changes

- Remover a coluna **Moderação** (`pending_approval`) do Mural de Trabalho.
- Novas **tarefas e demandas** passam a ser criadas diretamente com status `open` e aparecem na coluna **Open**.
- **BREAKING**: remover a etapa de moderação/aprovação de atividades. O status `pending_approval` deixa de ser atribuído a novas atividades e o fluxo de aprovar/rejeitar do Conselho Transversal deixa de existir para o Mural de Trabalho.
- Tratar as atividades que hoje estão em `pending_approval`: migrá-las para `open` (nenhuma atividade deve ficar "presa" numa coluna que não existe mais) e manter `rejected` apenas como registro de atividades rejeitadas/arquivadas.
- Ajustar/remover a interface de aprovar/rejeitar cards e os textos de i18n da moderação.
- Atualizar os testes que assumiam a coluna Moderação e o fluxo de aprovação.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capability: o comportamento é uma mudança nas capacidades existentes. -->

### Modified Capabilities
- `activity-moderation`: remover as permissões de moderação de tarefas e os rótulos de aprovar/rejeitar; a coluna de Moderação deixa de existir.
- `transversal-council-workflow`: remover o dashboard de moderação, as ações de aprovar/rejeitar tarefas e a ligação da role `transversal_council` com a moderação do Mural.
- `gift-economy-tasks`: novas tarefas/demandas nascem com status `open`; remover as restrições de visibilidade baseadas em `pending_approval`.
- `work-wall-responsive-navigation`: remover a ocultação de tarefas `pending_approval` e a aba/coluna Moderação para conselheiros.
- `task-execution`: a "ativação" de uma atividade não depende mais de aprovação por moderação.

## Impact

- **Frontend**: `src/pages/WorkWall.tsx` (`ColumnDef`/`columnDefs`, `handleDropCard`), componentes de coluna/card, botões Aprovar/Rejeitar, `src/locales/{pt,en}/translation.json` (chave `work.moderation`).
- **Backend/Supabase**: `supabase/functions/api-work/index.ts` (`createActivity` define `status`; remover/neutralizar `moderateActivity`), default da coluna `activities.status`, RLS que esconde tarefas `pending_approval`, uso do enum `activity_status.pending_approval`, e migração de dados das linhas existentes.
- **Testes**: `src/pages/WorkWallModeration.test.tsx`, `tests/transversal-council.spec.ts`, `tests/beneficiary-confirmation.spec.ts` e demais mocks de `moderateActivity`.
- **Specs**: `activity-moderation`, `transversal-council-workflow`, `gift-economy-tasks`, `work-wall-responsive-navigation`, `task-execution`.
