## 1. Sanitize Chat History

- [x] 1.1 In `supabase/functions/ai-justica-restaurativa/index.ts`, format the `history` array exactly like in `ai-handler` to map `role` and `parts`, and then `shift()` the first message if it is from the model.

## 2. Improve Error Logging

- [x] 2.1 In `supabase/functions/ai-justica-restaurativa/index.ts`, add a `console.error` to log the caught error in the outer `catch` block before returning the 400 Bad Request response.

## 3. Deploy Edge Function

- [x] 3.1 Run `npx supabase functions deploy ai-justica-restaurativa` to deploy the updated edge function.
