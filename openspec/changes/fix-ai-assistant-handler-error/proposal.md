## Why

The AI Assistant is currently returning a generic error message ("Desculpe, ocorreu um erro ao processar sua pergunta") when users attempt to interact with it. This is likely due to:
1. Missing `GEMINI_API_KEY` in the environment.
2. An error in the streaming response implementation in the `ai-handler` Edge Function.
3. Frontend parsing errors when handling the event stream.

## What Changes

- **Backend**: Update `ai-handler` Edge Function to provide more descriptive error logging and ensure the streaming response is correctly formatted.
- **Frontend**: Improve error handling in `AIAgent.tsx` and `gemini.ts` to capture and display specific error messages from the backend when possible.
- **Environment**: Document the requirement for `GEMINI_API_KEY` to be set in the Supabase vault/environment.

## Capabilities

### Modified Capabilities
- `ai-tool-executor`: Improve error handling and recovery for AI-driven tool execution.

## Impact

- **APIs**: `ai-handler` Edge Function.
- **Frontend**: `AIAgent.tsx`, `gemini.ts`.
