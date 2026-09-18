## Why

The AI Agent currently fails to generate content because `gemini-1.0-pro` is returning a 404 Not Found error (`models/gemini-1.0-pro is not found for API version v1beta, or is not supported for generateContent`). The system's fallback mechanism or the model itself is failing, leading to a service unavailable message in the UI ("Nossos sistemas de IA estão temporariamente indisponíveis").

## What Changes

- Update the default AI model in the `ai-handler` from `gemini-1.0-pro` to `gemini-1.5-pro` (or a similar currently supported model version in v1beta).
- Ensure model fallback mechanisms properly catch API version / model deprecation errors.

## Capabilities

### New Capabilities
- (None)

### Modified Capabilities
- (None)

## Impact

- `supabase/functions/ai-handler/index.ts` (or similar file containing model string) will be updated.
- AI operations will resume functioning using the newer model.
