## Why

O mural de trabalho (`/work-wall`) é onde os membros encontram demandas e tarefas, mas criar uma demanda ou tarefa exige preencher um formulário longo e entender regras como confirmações mínimas, executores e recompensa. O mural também não explica a si mesmo: quem chega pela primeira vez não sabe o que significa cada status, como uma tarefa é assumida, validada e paga.

Já existe um assistente de IA, o Oráculo (`/ai`, spec `oracle-chat`), mas ele não está no mural, não conhece o fluxo de trabalho e só consegue ler dados (saldo e histórico), por causa da restrição de ferramentas somente leitura da spec `ai-tool-executor`.

## What Changes

- O mural ganha um assistente de IA acessível diretamente da tela, que reutiliza o motor do Oráculo (`ai-handler`) com um modo específico para o mural.
- O assistente explica o funcionamento do mural: status das tarefas, como assumir, enviar evidências, confirmar e receber recompensa, e a diferença entre tarefa e demanda. As explicações são ancoradas no guia do mural e nos documentos oficiais, como o Oráculo já faz.
- O assistente ajuda a **criar demandas e tarefas** a partir de uma conversa: coleta título, descrição, recompensa, categoria, método de validação, confirmações e executores, e monta um rascunho.
- **Nenhuma criação acontece sem confirmação explícita do usuário.** O assistente mostra o resumo completo do rascunho e só grava quando o usuário clica em "Criar".
- A gravação usa a mesma ação `api-work.createActivity` das telas de criação, com a sessão do próprio usuário. A IA não grava com credenciais de serviço.
- **BREAKING** para a spec `ai-tool-executor`: a restrição "somente leitura" deixa de valer para a ferramenta de criação de atividade, e só para ela. Nenhuma outra escrita (transferências, edição, confirmação, exclusão, claim) é liberada.

## Capabilities

### New Capabilities

- `work-wall-assistant`: assistente de IA no mural que explica o funcionamento do mural e ajuda a criar demandas e tarefas mediante confirmação explícita do usuário.

### Modified Capabilities

- `ai-tool-executor`: a restrição de ferramentas somente leitura passa a permitir uma única ferramenta de escrita (criação de atividade), exigindo confirmação explícita do usuário antes da gravação.

## Impact

- **Frontend**: `src/pages/WorkWall.tsx` (ponto de entrada do assistente), componente de chat reutilizado de `src/pages/AIAgent.tsx`, traduções em `src/locales/{pt,en}/translation.json`.
- **Backend**: `supabase/functions/ai-handler/index.ts` (novo modo do mural, nova declaração de ferramenta de criação, fluxo de confirmação) e `supabase/functions/api-work/index.ts` (sem mudança de contrato; reutilizada como está).
- **Dados**: nenhuma migração de banco. Criações passam pela tabela `activities` como hoje.
- **Sem impacto em**: transferências de Surreals, edição e confirmação de tarefas, carteira, e o Oráculo em `/ai` continua com o comportamento somente leitura atual.
