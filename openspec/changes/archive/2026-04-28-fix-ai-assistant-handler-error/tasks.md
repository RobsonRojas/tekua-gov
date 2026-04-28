## 1. Backend: Edge Function Improvements

- [x] 1.1 Update `supabase/functions/ai-handler/index.ts` to improve error handling in the stream loop.
- [x] 1.2 Add explicit checks for `GEMINI_API_KEY` and return a clear error if missing.
- [x] 1.3 Ensure `Access-Control-Allow-Origin` and other headers are correctly set in all error responses.

## 2. Frontend: Resilience

- [x] 2.1 Update `src/lib/gemini.ts` to handle partial or malformed stream lines more robustly.
- [x] 2.2 Improve `src/pages/AIAgent.tsx` to display specific error messages from the AI stream when available.

## 3. Verification

- [x] 3.1 Verify that the AI Assistant responds to a simple "Olá" without errors.
- [x] 3.2 Test error handling by temporarily removing the API key (if safe) or simulating a network failure.
