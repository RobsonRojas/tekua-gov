## Context

See `proposal.md` for the motivation. The `ai-handler` edge function uses `@google/generative-ai` to stream responses. When a model like `gemini-1.5-flash` returns a 404 (or other upstream errors), the entire edge function currently fails and returns an error to the frontend.

## Goals / Non-Goals

**Goals:**
- Implement a fallback mechanism that automatically tries a predefined list of Gemini models if the requested or default one fails.
- Maintain the streaming response format if any of the fallback models succeed.
- Provide a localized error message to the frontend when all candidate models fail.

**Non-Goals:**
- Implementing complex routing or load balancing across multiple API keys.
- Supporting models from providers other than Google (Gemini) in this handler.

## Decisions

**Decision 1: Iterative Fallback Array**
- We will define a list of candidate models, starting with the requested default model and followed by reliable fallbacks: e.g., `['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']`.
- A `for...of` loop will be used to iterate over these models. For each iteration, we'll attempt to call `model.generateContentStream()`.
- If the call throws an error (e.g., 404), we catch it, log the failure for debugging, and continue to the next model in the array.
- If it succeeds, we return the stream immediately and exit the loop.
- **Alternatives Considered**: We considered querying a database table for available models, but a hardcoded array of known stable models is faster, simpler, and less prone to DB-related failures during an already unstable scenario.

**Decision 2: Error Handling When All Models Fail**
- If the loop completes without returning a stream (meaning all models threw an error), we will return a standard `Response` object with a 503 Service Unavailable status and a JSON payload containing a user-friendly error message (`Nossos sistemas de IA estão temporariamente indisponíveis...`).
- **Alternatives Considered**: We could return an empty stream or just throw an unhandled exception, but returning a structured error response allows the frontend to display a clear message instead of a generic connection error.

## Risks / Trade-offs

- **Risk**: Increased TTFB (Time to First Byte) latency if the first model fails, as the function will have to make a secondary API call before returning the stream.
  → **Mitigation**: We will ensure the primary model configured in the DB or the hardcoded preferred model is the most stable and available one, minimizing the chance of hitting the fallback path. The timeout for each attempt should also be reasonable to prevent long hangs.
