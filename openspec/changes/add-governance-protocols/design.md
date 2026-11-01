## Context

Governança é uma página de cartões de serviço (`GovernanceServices.tsx`). O mural já tem um campo opcional parecido, a área de atuação (`activities.category_id` → `work_categories`), enviado como `categoryId` em `createActivity`. A criação de convocações restaurativas é o padrão de escrita sem política de INSERT para clientes, passando pela `api-governance` com checagem de papel.

## Goals / Non-Goals

**Goals:**
- Cadastro e consulta de protocolos com controle de quem escreve.
- Um protocolo opcional por tarefa ou demanda, na criação e na edição.

**Non-Goals:**
- Vários protocolos por atividade.
- Histórico de versões do texto.
- Registro de Trabalho (`submit_activity`).
- Exigir que o executor leia ou confirme o protocolo.

## Decisions

### D1 – Tabela `governance_protocols` e coluna `activities.protocol_id`

**Escolha:** `governance_protocols (id, title, content, status, created_by, created_at, updated_at)`, com `title` de 1 a 200 caracteres, `content` em Markdown até 20000, `status` em `active` ou `archived`. Em `activities`, `protocol_id UUID NULL REFERENCES governance_protocols(id) ON DELETE SET NULL`.

**Rationale:** um vínculo direto basta para um protocolo por atividade e segue o padrão de `category_id`. Arquivar em vez de apagar preserva o vínculo das atividades antigas.

### D2 – Escrita só pela `api-governance`, leitura por qualquer membro

**Escolha:** RLS permite SELECT a usuários autenticados e nenhuma política de escrita ao cliente. As ações `createProtocol`, `updateProtocol` e `setProtocolStatus` exigem papel `admin` ou `transversal_council`. `listProtocols` e `fetchProtocol` valem para qualquer autenticado; só quem escreve recebe os arquivados.

**Rationale:** mesmo modelo das convocações. O papel é lido de `profiles.role` e `profiles.roles`; a checagem existente `isAdminUser` só cobre `admin`, então o conselho precisa de uma checagem própria.

### D3 – O vínculo é validado em `api-work`

**Escolha:** `createActivity` e `updateActivity` aceitam `protocolId` opcional. Quando informado, o protocolo precisa existir e estar ativo; senão, a chamada falha. Na edição, manter o mesmo protocolo já vinculado é permitido mesmo arquivado, e enviar `null` remove o vínculo.

**Rationale:** impede vincular a um protocolo arquivado ou inexistente sem quebrar a edição de atividades antigas.

### D4 – Seleção com pesquisa por componente próprio

**Escolha:** um `Autocomplete` do MUI, com filtro local por título sobre a lista de protocolos ativos, opcional e com opção de limpar. Usado em `CreateTask`, `CreateDemand` e na edição de `TaskDetail`.

**Rationale:** a lista de protocolos de uma vila é pequena, então carregá-la uma vez e filtrar no cliente evita nova rota de busca.

### D5 – Exibição

**Escolha:** o detalhe da atividade mostra o título do protocolo como link que abre o texto completo em um diálogo, renderizado com `SafeMarkdown`.

## Risks / Trade-offs

- **Texto de protocolo com HTML ou links perigosos** → `SafeMarkdown` já sanitiza e bloqueia protocolos perigosos.
- **Conselho sem permissão por usar a checagem só de admin** → D2 define checagem própria para `transversal_council`.
- **Protocolo apagado** → não há exclusão, só arquivamento; `ON DELETE SET NULL` cobre remoção manual no banco.

## Migration Plan

Aplicar a migration antes do deploy das edge functions. A coluna é opcional, então atividades existentes não mudam.

## Open Questions

Nenhuma.
