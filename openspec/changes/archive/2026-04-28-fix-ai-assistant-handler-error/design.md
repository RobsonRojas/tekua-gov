## Context

The AI Assistant is failing due to unhandled errors in the Edge Function or the streaming connection. The current `ai-handler` catch-all (line 242) might be hiding the root cause or providing insufficient information to the frontend.

## Goals / Non-Goals

**Goals:**
- Provide clear error messages when the AI service is misconfigured.
- Ensure the frontend correctly interprets and displays errors from the AI event stream.
- Verify environmental requirements (API keys).

**Non-Goals:**
- Switching to a different LLM provider.
- Improving the AI model's accuracy.

## Decisions

### 1. Robust Error Events in Stream
- **Decision**: Update `ai-handler` to always wrap errors in a JSON object with a `type: 'error'` field before closing the stream, ensuring the frontend can parse it.
- **Decision**: Improve the initial auth and config checks to return standard JSON 400/500 errors before the stream starts.

### 2. Frontend Stream Parsing
- **Decision**: Update `gemini.ts` to be more resilient to malformed JSON lines in the buffer.

## Risks / Trade-offs

- **Risk**: Leaking sensitive API error details to the end-user.
  - **Mitigation**: Sanitize error messages in the Edge Function before sending them to the frontend.
