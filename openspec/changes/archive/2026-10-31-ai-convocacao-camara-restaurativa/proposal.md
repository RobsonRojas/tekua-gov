## Why

O Agente de IA de Justiça Restaurativa orienta os usuários pelos 4 passos do protocolo, mas ao chegar ao Passo 4 (Câmara de Justiça Restaurativa) apenas recomenda verbalmente a convocação — o usuário precisa sair do chat, navegar até o wizard e preencher o formulário manualmente. Isso quebra o fluxo, aumenta a fricção e pode fazer o membro desistir do processo. Ao habilitar o agente a convocar a Câmara diretamente — com confirmação explícita do usuário antes de qualquer ação — fecha-se o ciclo do Passo 4 dentro da própria conversa.

## What Changes

- Adicionar suporte a **function calling** na edge function `ai-justica-restaurativa`, seguindo o padrão já estabelecido em `ai-handler` (workWall).
- Declarar a ferramenta `propose_circle_convocation` que coleta os dados necessários para uma convocação de Câmara: tema, descrição, data/hora agendada e local/link.
- O agente **não cria a convocação diretamente**: ao coletar todos os dados obrigatórios, a ferramenta retorna um **rascunho** para o frontend exibir ao usuário — que confirma ou cancela na interface.
- Ao confirmar, o frontend chama `createRestorativeCircle` em `api-governance` (handler já existente).
- Atualizar o system prompt do agente para incluir a instrução de usar a ferramenta quando o usuário chega ao Passo 4 e está pronto para convocar.
- Atualizar o `AgenteChat` no frontend para processar o evento de rascunho de convocação e exibir o card de confirmação.

## Capabilities

### New Capabilities
- `ai-convocacao-camara`: Capacidade do agente de IA de Justiça Restaurativa de propor um rascunho de convocação de Câmara Restaurativa via function calling, com confirmação explícita do usuário antes da criação.

### Modified Capabilities
- `justica-restaurativa-agente`: O agente passa a ter a capacidade de acionar o Passo 4 de forma ativa (convocação via ferramenta), além da orientação verbal já existente.
- `ai-tool-executor`: A restrição de "somente leitura" é relaxada **apenas** para a ferramenta de rascunho de convocação — que não grava nada, apenas propõe um rascunho ao usuário para confirmação.

## Impact

- **Backend**: `supabase/functions/ai-justica-restaurativa/index.ts` — adicionar function calling + handler do resultado da ferramenta.
- **Frontend**: `src/components/JusticaRestaurativa/AgenteChat.tsx` — processar evento `tool_draft` e exibir card de confirmação de convocação.
- **Sem novas migrações**: usa `createRestorativeCircle` já existente em `api-governance`.
- **Sem alteração de schema de banco**: nenhuma nova tabela ou coluna.
