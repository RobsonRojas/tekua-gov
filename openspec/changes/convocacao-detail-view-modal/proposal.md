## Why

A lista de convocações de Círculo Restaurativo exibe apenas metadados básicos (tema, status, autor, datas). O administrador precisa consultar todos os detalhes de uma convocação sem sair da tela: tema completo, descrição, local/link, data agendada, confirmação dos pré-círculos individuais e o contexto do wizard que gerou a solicitação (passos 1–4 percorridos). Atualmente, a única forma de ver esses dados é abrindo a página de compartilhamento pelo token, o que é ineficiente e perde o contexto de navegação do painel de governança.

## What Changes

- Adicionar um botão **"Ver detalhes"** (ícone de olho / `Visibility`) em cada linha da tabela de convocações (`RestorativeCirclesTab`).
- Ao clicar, abrir um **Dialog (modal)** com todas as informações da convocação:
  - Tema, descrição, local/link, data agendada, status, data de criação e autor.
  - Confirmação de pré-círculos individuais (campo `confirmed_pre_circles`).
  - Resumo do caminho percorrido no wizard (passos 1–4).
- Criar um novo handler de API `fetchRestorativeCircleById` no `api-governance` que retorna o registro completo dado o `id` — disponível apenas para administradores.
- Extrair componente reutilizável `RestorativeCircleDetailDialog` em `src/components/admin/`.

## Capabilities

### New Capabilities
- `restorative-circle-detail-view`: Visualização de detalhes completos de uma convocação via modal no painel de governança.

### Modified Capabilities
- (nenhuma)

## Impact

- **Frontend**: `src/components/admin/RestorativeCirclesTab.tsx` (botão + state de modal), novo `src/components/admin/RestorativeCircleDetailDialog.tsx`.
- **Backend**: `supabase/functions/api-governance/index.ts` — novo case `fetchRestorativeCircleById` (somente admin).
- **Banco de dados**: nenhuma migração necessária; `confirmed_pre_circles` já existe em `restorative_circles`.
- **i18n**: novas chaves para rótulos do modal.
