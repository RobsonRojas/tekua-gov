## Context

The `ai-handler` edge function uses the Gemini API, which requires the conversation history to strictly start with a message from the `user` role. Currently, the function sends the raw message history without filtering or formatting it, which leads to `First content should be with role 'user', got model` when the UI passes a history that happens to start with a model message (e.g., a welcome message). Furthermore, there is no redundancy in model usage. If the primary model fails, the request fails. Lastly, the default model is hardcoded, preventing administrators from dynamically choosing the model (e.g., upgrading from Gemini 1.5 Flash to Pro).

## Goals / Non-Goals

**Goals:**
- Ensure the conversation history provided to the Gemini API is correctly formatted, always starting with a `user` message.
- Implement a fallback mechanism for model selection in `ai-handler` to gracefully handle API failures.
- Introduce an administrative interface to configure the default model and fallback list.

**Non-Goals:**
- Building a complex model health tracking system. The fallback will simply iterate through the available models upon request failure.
- Supporting models outside of the Google Gemini API (no OpenAI, Anthropic, etc. for now).

## Decisions

### History Formatting
Before passing the message history to the Gemini API, the `ai-handler` will iterate through the history. If the first message in the array is from the `model`, it will either be removed or prepended with a generic `user` prompt (e.g., "Start conversation"). Removing the first `model` message is the safest and cleanest approach since the context is usually established by subsequent messages or the system instruction.

### Fallback Mechanism
The edge function will retrieve a list of models (the default model first, followed by fallbacks). It will wrap the API call in a `try...catch` block. If a call fails, it will attempt the next model in the list. If all models fail, it will return a friendly error response to the client.

### Admin Configuration
We will utilize the existing settings table (or create one if it doesn't exist) to store a `default_ai_model` setting. The admin panel will fetch this setting and allow administrators with the 'admin' role to update it via the UI.

## Risks / Trade-offs

- **Risk**: Iterating through multiple models on failure could increase latency, causing edge function timeouts.
  **Mitigation**: Limit the number of fallback attempts (e.g., maximum of 2 fallbacks) and use models with fast response times as fallbacks (e.g., `gemini-1.5-flash`).
- **Risk**: Changing models mid-conversation could alter the AI's "personality" or response style.
  **Mitigation**: A minor trade-off for higher availability. The system instructions will be passed identically to all models, minimizing behavioral differences.
