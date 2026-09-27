## 1. Fix Auth in Edge Function

- [x] 1.1 In `supabase/functions/ai-justica-restaurativa/index.ts`, update the `@supabase/supabase-js` import to version `2.39.7`.
- [x] 1.2 In `supabase/functions/ai-justica-restaurativa/index.ts`, extract the JWT token from `authHeader` using `const token = authHeader.replace('Bearer ', '')`.
- [x] 1.3 In `supabase/functions/ai-justica-restaurativa/index.ts`, update the `getUser` call to pass the token explicitly: `await supabaseClient.auth.getUser(token)`.

## 2. Deploy

- [x] 2.1 Deploy the `ai-justica-restaurativa` edge function using `npx supabase functions deploy ai-justica-restaurativa`.
