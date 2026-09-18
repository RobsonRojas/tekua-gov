## Context

The `ai-handler` Supabase edge function currently relies on `gemini-1.0-pro`, which is no longer supported for `generateContent` in the API version we are using. See `proposal.md` for more details.

## Goals / Non-Goals

**Goals:**
- Restore AI functionality by switching to a supported model.

**Non-Goals:**
- Completely rewriting the AI handler or changing the SDK version.

## Decisions

- **Decision 1: Use `gemini-1.5-pro` (or flash) as default.**
  - **Rationale:** `gemini-1.5-pro` is the direct successor and supported in v1beta. It has better context handling and instruction following.
  - **Alternative considered:** Updating the SDK and using the new `gemini-2.0-flash`. Since this is a quick fix, we'll try the simplest model name swap first.

## Risks / Trade-offs

- None expected, as this is a drop-in replacement of the model string.
