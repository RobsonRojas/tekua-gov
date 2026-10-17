## 1. Update Fallback Models

- [x] 1.1 Update `fallbackModels` logic in `supabase/functions/ai-handler/index.ts` to dynamically fetch the list of supported models from the Gemini API using `listModels()` (or the REST equivalent) and cache it in memory. Filter the list for models that support `generateContent`.

## 2. Verification

- [x] 2.1 Test the Oracle AI chat functionality in the UI to confirm it successfully generates responses without triggering the fallback error message.
