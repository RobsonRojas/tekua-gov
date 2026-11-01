## Context

O painel de governança (`RestorativeCirclesTab`) usa MUI (`Table`, `Button`, `Chip`) com dados carregados via `apiClient.invoke('api-governance', 'fetchAllRestorativeCircles')`. A edge function `api-governance` já expõe handlers para listar, fechar e cancelar convocações. O handler `fetchAllRestorativeCircles` retorna apenas os campos necessários para a listagem, sem `description`, `location_or_link` ou `confirmed_pre_circles`.

Ver proposal.md – Why para motivação.

## Goals / Non-Goals

**Goals:**
- Exibir modal com dados completos de uma convocação via botão na linha da tabela.
- Novo handler de API admin-only (`fetchRestorativeCircleById`) que retorna todos os campos necessários.
- Componente de modal isolado e testável.

**Non-Goals:**
- Edição de dados via modal (somente leitura).
- Exposição do modal para usuários não-admin (a aba já é restrita a admins).
- Alteração do wizard ou do formulário de criação.

## Decisions

### D1 – Busca lazy dos detalhes ao abrir o modal (em vez de enriquecer a listagem)

**Escolha:** Ao clicar em "Ver detalhes", o modal dispara um `fetchRestorativeCircleById` apenas para aquele ID. Não se enriquece o `fetchAllRestorativeCircles` com todos os campos.

**Rationale:** A listagem pode ter dezenas de registros; carregar `description` e `confirmed_pre_circles` de todos adicionaria payload desnecessário. A busca on-demand mantém a listagem leve.

**Alternativa considerada:** Enriquecer `fetchAllRestorativeCircles` — simples de implementar, mas desperdiça banda e torna a resposta mais lenta para uma coluna raramente consultada.

### D2 – Componente `RestorativeCircleDetailDialog` como componente separado

**Escolha:** Extrair o modal para `src/components/admin/RestorativeCircleDetailDialog.tsx`.

**Rationale:** `RestorativeCirclesTab` já é extenso; isolar o modal facilita testes unitários e reutilização futura (ex: visualização do mesmo modal em outras telas admin).

### D3 – Handler `fetchRestorativeCircleById` via `supabaseAdmin` (admin-only)

**Escolha:** O novo handler usa `supabaseAdmin` e valida `isAdminUser` antes de consultar, mesmo padrão do `fetchAllRestorativeCircles` e `cancelRestorativeCircle`.

**Rationale:** Consistência com o padrão já estabelecido na edge function. Não expõe dados sensíveis a usuários comuns.

### D4 – Resumo do wizard como seção informativa estática

**Escolha:** O modal exibe um card estático descrevendo os 4 passos do Protocolo de Justiça Restaurativa e indica que a convocação foi gerada ao final do Passo 4, sem armazenar as respostas do wizard no banco.

**Rationale:** O wizard atual (`WizardFlow.tsx`) não persiste as respostas OSNP no banco de dados — elas são state local descartado após o submit. Portanto, não há dado de wizard a recuperar. O card informativo contextualiza o processo sem exigir mudança de schema.

**Dívida técnica:** Se futuramente o wizard persistir respostas por passo, o modal pode ser atualizado para exibi-las via um campo JSON no registro.

## Risks / Trade-offs

- **Novo round-trip ao abrir modal** → Aceito; a latência é imperceptível em rede local e mitiga payload desnecessário na listagem.
- **`confirmed_pre_circles` não está no schema atual da tabela** → Verificar se a coluna existe; se não existir, a proposta assume que ela precisa ser adicionada ou o campo é omitido do modal com graceful fallback.

## Open Questions

- A coluna `confirmed_pre_circles` já existe em `restorative_circles`? (Verificar migration `20261026000000_restorative_circles.sql` — o campo não apareceu no schema; pode precisar de uma migration simples `ALTER TABLE ... ADD COLUMN confirmed_pre_circles BOOLEAN NOT NULL DEFAULT false` se ainda não existir.)
