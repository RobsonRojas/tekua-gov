## Context

The `ai-justica-restaurativa` edge function is crashing with a 400 error ("Erro inesperado"). See proposal.md for motivation. The root cause is that the Google Generative AI SDK's `startChat` method requires the conversation history to start with a `user` message. However, the Restorative Justice frontend sends the model's initial greeting as the first message in the `messages` array, which causes `startChat` to throw an error synchronously.

## Goals / Non-Goals

**Goals:**
- Prevent the 400 error when the conversation history starts with a model message.
- Improve error logging in the edge function for easier debugging.

**Non-Goals:**
- We are not changing the frontend logic for how it displays or stores the initial greeting; we will handle this defensively on the backend.

## Decisions

**1. Sanitize Chat History (Remove initial model message)**
- **Rationale**: We will format the history and `shift()` the first message if it has `role === 'model'`. This is a proven pattern already used in `ai-handler`.
- **Alternatives Considered**: Modifying the frontend to exclude the first message when sending the payload. While also valid, fixing this on the edge function makes the API more robust against arbitrary valid UI states.

**2. Add Error Logging to Catch Block**
- **Rationale**: The outer `catch` block currently suppresses the actual error message and returns a generic 400 response. Adding `console.error` will surface the real errors (like the `startChat` validation failure) in the Supabase edge function logs.

## Risks / Trade-offs

- [Risk] If the history contains multiple consecutive model messages, `startChat` might still throw (it expects strict alternation).
  → Mitigation: In the context of this specific UI, the interaction is strictly alternating after the initial greeting, so just removing the first model message is sufficient to fix the current crash.
