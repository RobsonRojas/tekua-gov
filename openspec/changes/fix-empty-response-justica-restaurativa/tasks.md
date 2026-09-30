## 1. Implement Model Fallback Loop

- [x] 1.1 In `supabase/functions/ai-justica-restaurativa/index.ts`, add the `getFallbackModels` function and caching logic from `ai-handler`.
- [x] 1.2 In `supabase/functions/ai-justica-restaurativa/index.ts`, implement the `modelsToTry` array and wrap the model initialization and stream processing inside a `for (const modelName of modelsToTry)` loop.
- [x] 1.3 Update the stream response logic to set `success = true; break;` on success, catch errors to continue the loop, and if all models fail, send an error event `sendEvent({ type: 'error', message: ... })`.

## 2. Deploy Edge Function

- [x] 2.1 Run `npx supabase functions deploy ai-justica-restaurativa` to deploy the updated edge function.
