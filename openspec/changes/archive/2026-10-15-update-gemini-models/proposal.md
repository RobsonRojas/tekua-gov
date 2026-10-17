## Why

The current AI fallback implementation relies on Gemini models that are either no longer available or not supported on the currently used API version (`gemini-2.0-flash` returns a 404 and suggests `gemini-3.6-flash`; `gemini-1.5-pro` is also not found for `v1beta`). This causes the AI handler to fail completely and display the fallback error message: "Nossos sistemas de IA estão temporariamente indisponíveis."

## What Changes

- Update the `ai-handler` edge function to dynamically fetch the list of supported models from the Gemini API (`models.list` / `listModels`) and cache them in memory. This replaces the hardcoded list of fallback models, ensuring the function automatically adapts to new or deprecated models without manual updates.
- Update the system specs to reflect the dynamic model lookup in the fallback scenario.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `ai-guidance`: Update the "Fallback Automático de Modelos" requirement scenario to reference the new list of supported models.

## Impact

- `supabase/functions/ai-handler/index.ts`
- Specifications for the `ai-guidance` capability.
