## 1. Implement Model Fallback Loop

- [x] 1.1 Update `supabase/functions/ai-handler/index.ts` to define a list of candidate models (e.g., `['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']`).
- [x] 1.2 Refactor the existing single `model.generateContentStream` call into a `for...of` loop over the candidate models.
- [x] 1.3 Add a `try/catch` block inside the loop to catch errors (such as 404s), log the failure, and continue to the next model.
- [x] 1.4 Ensure that upon success, the loop breaks and returns the valid stream immediately.
- [x] 1.5 Add error handling after the loop: if all models fail, return a 503 `Response` with a JSON payload containing a friendly error message.

## 2. Validation

- [x] 2.1 Manually verify the function locally using `supabase functions serve` or by invoking it via the platform to ensure that failures trigger the next model in the list.
