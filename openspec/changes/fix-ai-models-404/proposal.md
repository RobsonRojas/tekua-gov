## Why

Ao tentar enviar mensagens para o Oráculo, o edge function `ai-handler` reporta que os sistemas estão indisponíveis porque todos os modelos de fallback falharam. O log revela que o erro fatal é do modelo `gemini-2.0-flash-exp`, que está falhando com HTTP 404 (Not Found) na API v1beta do Google. É necessário corrigir a lista de modelos suportados para restabelecer o funcionamento do chat.

## What Changes

- **Atualização da Lista de Modelos**: O modelo `gemini-2.0-flash-exp` (que não é mais suportado no endpoint v1beta ou teve o nome alterado) será removido da função `getFallbackModels` e/ou substituído por modelos estáveis (como apenas as versões `gemini-1.5-flash` e `gemini-1.5-pro` ou as flags atualizadas corretas).

## Capabilities

### New Capabilities
*(Nenhuma, mudança puramente técnica de correção).*

### Modified Capabilities
*(Nenhuma alteração de requisitos. A validação aceitará essa ausência pois configuramos `skip_specs: true`).*

## Impact

- **Backend**: Atualização pontual em `supabase/functions/ai-handler/index.ts` na lista estática. Isso irá restaurar a estabilidade do Oráculo.
