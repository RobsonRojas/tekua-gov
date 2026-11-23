## Context

Ver `proposal.md → Why` para motivação. O sistema de votação e comentários em pautas apresenta três defeitos:

1. **Vote toggle ausente:** `fetchTopicDetail` retorna apenas `userVoted: boolean`; o frontend desabilita os botões quando `hasVoted === true`. O backend já usa `upsert` para votos — suporta troca de opção — mas não há endpoint para remoção.
2. **Menção sem filtro:** `api-members/fetchUsers` recebe o parâmetro `search` mas a query Supabase nunca aplica `.ilike('full_name', ...)`, retornando todos os membros em toda chamada de menção.
3. **`content_old` NOT NULL:** A migration `20260410000001` renomeou `content` → `content_old` e criou nova coluna JSONB `content`. Contudo, a coluna `content_old` manteve a constraint `NOT NULL`. Um trigger ou a constraint original ainda exige o campo no insert, causando o 400.

## Goals / Non-Goals

**Goals:**
- Botões de voto clicáveis após votar, com destaque visual no voto atual e suporte a remoção/troca.
- Campo `@mention` filtra membros em tempo real conforme texto digitado.
- Comentários persistem sem erro de DB.

**Non-Goals:**
- Histórico de trocas de voto / audit trail.
- Restrições de quantas trocas são permitidas por sessão.
- Redesign da UI de votação além das mudanças necessárias para o toggle.

## Decisions

### 1. Endpoint `removeVote` separado de `castVote`
**Decisão:** Adicionar um novo case `removeVote` no `api-governance` em vez de modificar `castVote` para aceitar `option: null`.
**Rationale:** Mantém semântica clara — `castVote` sempre registra, `removeVote` sempre apaga. Evita ambiguidade na validação de `option`.
**Alternativa considerada:** `castVote` com `option === null` → deletaria o voto. Rejeitado por poluir a assinatura existente.

### 2. Retornar `userVoteOption` em `fetchTopicDetail`
**Decisão:** Alterar `fetchTopicDetail` para retornar `userVoteOption: 'yes' | 'no' | 'abstain' | null` além do booleano `userVoted`.
**Rationale:** O frontend precisa saber qual opção o usuário escolheu para aplicar o destaque visual correto.

### 3. `handleVote` com lógica de toggle no frontend
**Decisão:** Se `userVoteOption === option` → chama `removeVote`; caso contrário → chama `castVote`. Manter `hasVoted` apenas para feedback de texto; usar `userVoteOption` para controlar estado dos botões.

### 4. Filtro `ilike` no `fetchUsers`
**Decisão:** Adicionar `.ilike('full_name', `%${search}%`)` condicional quando `search` não for vazio.
**Rationale:** Mínima invasão; respeita a lógica existente de admin vs. regular client.

### 5. Migration `content_old` nullable
**Decisão:** Criar nova migration que execute `ALTER TABLE topic_comments ALTER COLUMN content_old DROP NOT NULL;`.
**Rationale:** Solução cirúrgica sem perda de dados. A coluna `content_old` existe apenas por compatibilidade de migração de dados — novos inserts não precisam preenchê-la.
**Alternativa:** Remover a coluna inteiramente. Rejeitado por potencial de quebrar queries legadas em produção sem análise mais ampla.

## Risks / Trade-offs

- **[Risco] Trigger de auditoria legado:** Se existir trigger que escreve em `content_old` durante INSERT, torná-la nullable resolverá o NOT NULL mas o trigger ainda tentará preencher. → Mitigação: Verificar com `\d+ topic_comments` no staging antes de aplicar migration em produção.
- **[Trade-off] `removeVote` não desfaz recompensa:** A recompensa por participação em votação não é revertida ao remover o voto. Aceitável pelo escopo desta mudança.
- **[Risco] Concorrência de upsert:** Um `upsert` seguido imediatamente de `delete` em race condition pode deixar voto persistido. → Mitigação: Fluxo é user-initiated, sem risco prático de race.

## Migration Plan

1. Criar migration SQL: `ALTER TABLE topic_comments ALTER COLUMN content_old DROP NOT NULL;`
2. Deploy da Edge Function `api-governance` com `removeVote` e `fetchTopicDetail` atualizado.
3. Deploy da Edge Function `api-members` com filtro `search` em `fetchUsers`.
4. Deploy do frontend com `TopicDetail.tsx` atualizado.
5. Verificar no staging que comentário é inserido com sucesso e voto pode ser desfeito.
