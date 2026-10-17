# Design: Fix AI System Prompt Context

## Architecture/Component Changes

Não há mudança arquitetural. Apenas alteração do conteúdo string do `BASE_SYSTEM_PROMPT` na edge function do Supabase que atua no chat.

## Technical Details

1. **`supabase/functions/ai-handler/index.ts`**
   Na variável `BASE_SYSTEM_PROMPT`:
   - A linha `Seu objetivo é auxiliar membros da governança e trabalhadores extrativistas da Amazônia.` deve ser alterada para:
     `Seu objetivo é auxiliar membros da governança e comunidades no Portal Tekuá, uma plataforma de governança comunitária, gestão de demandas, economia circular descentralizada e justiça restaurativa projetada para aldeias e comunidades.`
   - Adicionar uma regra explícita em MAIÚSCULAS na seção de INSTRUÇÕES DE SEGURANÇA ou DIRETRIZES:
     `SUAS RESPOSTAS DEVEM SER ESTRITAMENTE BASEADAS NOS DOCUMENTOS OFICIAIS FORNECIDOS NAS TAGS <document_context>. SE A RESPOSTA NÃO PUDER SER ENCONTRADA NESSES DOCUMENTOS, VOCÊ DEVE INFORMAR QUE NÃO POSSUI ESSA INFORMAÇÃO NOS DOCUMENTOS OFICIAIS.`

2. **Supabase CLI**
   A edge function precisa ser redesdobrada (re-deploy) após a alteração para que o novo prompt entre em vigor.

## Open Questions

Nenhuma.
