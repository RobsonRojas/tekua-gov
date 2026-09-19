## Why

The `ai-handler` edge function is failing because the requested models (`gemini-1.5-flash` and `gemini-1.5-pro`) are returning a 404 Not Found error from the Gemini API. This prevents users from interacting with the AI Agent in the platform. To solve this and prevent future outages caused by a single model's unavailability, the AI handler needs to automatically test available models and fallback gracefully, selecting the first working model to respond.

## What Changes

- Modify `ai-handler` to support a list of candidate models (e.g., `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
- Iterate through the list of candidate models when processing a request.
- Attempt to generate the content stream with the current model in the list.
- If it fails (e.g. 404 Not Found, 503, etc.), log the failure and try the next model in the fallback list.
- Return the response from the first model that succeeds.
- If all models fail, return a generic unavailable error message to the frontend.

## Capabilities

### New Capabilities

### Modified Capabilities

- `ai-guidance`: Update the fallback scenario to explicitly handle model not found errors by testing multiple model variants and selecting the first available.

## Impact

- `supabase/functions/ai-handler/index.ts`: The core logic for model instantiation and stream generation will be wrapped in a retry/fallback loop.
- The user experience will be more resilient to upstream model deprecations or temporary API outages.
