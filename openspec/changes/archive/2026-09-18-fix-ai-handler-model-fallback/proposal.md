## Why

The AI Handler edge function is currently failing with a `First content should be with role 'user', got model` error when interacting with the Gemini API, which expects the initial history message to have the 'user' role. Furthermore, when the AI model fails, the system does not gracefully fall back to alternative models, resulting in poor user experience. An administrative setting to dynamically define the default model is missing, hardcoding the AI behavior.

## What Changes

- Fix the conversation history construction in the edge function so that the first message is guaranteed to have the 'user' role.
- Implement a fallback mechanism in the `ai-handler` to iterate through a list of alternative models if the primary model fails.
- Introduce informative, user-friendly error messages when all fallback models fail.
- Add an administrative interface in the admin panel to configure the default AI model for the handler.

## Capabilities

### New Capabilities

### Modified Capabilities
- `ai-guidance`: Needs fallback model support, informative error messages, and correctly formatted message history.
- `admin-panel`: Needs an administrative setting to define the default AI model to be used by the edge functions.

## Impact

- **Edge Functions**: `ai-handler` will be updated to handle conversation history parsing correctly and support model fallbacks.
- **Frontend**: The `admin-panel` will receive a new configuration input for AI models.
- **Database**: We may need a new settings table or update an existing one to store the default AI model globally.
