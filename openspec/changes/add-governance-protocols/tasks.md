## 1. Banco de dados

- [x] 1.1 Criar migration com a tabela `governance_protocols` (título 1–200, conteúdo até 20000, status `active`/`archived`, autor, datas), RLS de leitura para autenticados e sem política de escrita para clientes
- [x] 1.2 Na mesma migration, adicionar `activities.protocol_id` opcional com `ON DELETE SET NULL` e índice

## 2. Backend

- [x] 2.1 Em `api-governance`, criar checagem de papel para `admin` ou `transversal_council` e as ações `createProtocol`, `updateProtocol` e `setProtocolStatus`, com validação de título e tamanho
- [x] 2.2 Em `api-governance`, criar `listProtocols` (ativos para qualquer autenticado; arquivados só para quem escreve) e `fetchProtocol`
- [x] 2.3 Extrair as regras de validação e de papel em função pura, com teste `deno test` (título, tamanho, papéis permitidos e negados)
- [x] 2.4 Em `api-work`, aceitar `protocolId` em `createActivity` e `updateActivity`, validando que o protocolo existe e está ativo (mantendo o já vinculado na edição; `null` remove)
- [x] 2.5 Em `api-work`, incluir `protocol (id, title)` nas leituras de `fetchActivities` e `fetchActivityDetail`

## 3. Frontend — área de Governança

- [x] 3.1 Criar a página de protocolos com lista, pesquisa por título e diálogo de leitura renderizado com `SafeMarkdown`
- [x] 3.2 Para administradores e Conselho, adicionar criar, editar e arquivar; ocultar os controles para os demais
- [x] 3.3 Adicionar o cartão "Protocolos e POPs" em `GovernanceServices.tsx` e a rota da página
- [x] 3.4 Adicionar as chaves i18n pt/en

## 4. Frontend — mural

- [x] 4.1 Criar o componente de seleção com pesquisa (opcional, com limpar) sobre os protocolos ativos
- [x] 4.2 Usar o componente em `CreateTask.tsx` e `CreateDemand.tsx`, enviando `protocolId`
- [x] 4.3 Usar o componente na edição de `TaskDetail.tsx`, enviando `protocolId`
- [x] 4.4 Exibir o protocolo vinculado no detalhe, com acesso ao texto completo

## 5. Validação

- [x] 5.1 Testes de renderização: página de protocolos (lista, pesquisa, controles ocultos para membro comum) e componente de seleção
- [x] 5.2 Testar criação e edição de atividade com e sem protocolo
- [x] 5.3 Executar `npm run build` sem erros
