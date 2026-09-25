## Why

Atualmente, ao perguntar ao Oráculo (AI Agent) o que é a Tekuá, a resposta afirma que é uma "plataforma voltada para apoiar membros da governança e trabalhadores extrativistas da Amazônia". O projeto Tekuá-Gov é, na verdade, focado de modo genérico em "governança comunitária, gestão de demandas, economia circular descentralizada e justiça restaurativa projetada para aldeias e comunidades". O prompt atual do sistema embutido na Edge Function possui uma referência arbitrária à "Amazônia" e a "extrativistas" que não está alinhada ao escopo geral do projeto. Além disso, as respostas do Oráculo precisam ser restritas estritamente aos documentos oficiais alimentados pelo Gerenciador de Documentos Oficiais.

## What Changes

- Atualizar o `BASE_SYSTEM_PROMPT` na função serverless `ai-handler` removendo o escopo estrito da Amazônia e ajustando-o para refletir a verdadeira natureza do Portal Tekuá.
- Adicionar no `BASE_SYSTEM_PROMPT` a instrução explícita de que as fontes das respostas devem ser estritamente os documentos fornecidos no contexto (do Gerenciador de Documentos Oficiais).

## Capabilities

### New Capabilities
*(nenhuma)*

### Modified Capabilities
- `oracle-chat`: O Oráculo passará a descrever a plataforma corretamente e ancorará rigorosamente suas respostas aos documentos oficiais da governança.

## Impact

- `supabase/functions/ai-handler/index.ts` (precisará de redeploy)
