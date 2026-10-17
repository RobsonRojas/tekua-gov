## Why

The Restorative Justice AI agent (`ai-justica-restaurativa`) currently relies on a single hardcoded model (`gemini-1.5-flash`). When the Gemini API fails, returns an empty response, or blocks content due to safety filters, the chat simply returns an empty or error response. The `ai-handler` function already solves this by implementing a robust fallback mechanism that tries alternative models if the default one fails.

## What Changes

- Implement the `getFallbackModels` function (as used in `ai-handler`) to dynamically fetch available models.
- Update the AI processing logic to iterate through a list of `modelsToTry` (default + fallbacks).
- If `sendMessageStream` fails, the code should catch the error and try the next model in the list.
- Keep the streaming response (`text_chunk` / `text_complete`) but wrap the model initialization and execution in the retry loop.
- Remove the empty history message filtering as the primary fix, and instead rely on the robust fallback loop and proper error streaming.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None. (This is a bug fix for the implementation of the chat edge function.)

## Impact

- `supabase/functions/ai-justica-restaurativa/index.ts` will be updated to include the fallback model loop.
- Users will experience fewer errors and empty responses, as the agent will automatically try another model if the first one fails.
