## 1. Edge Function Fix

- [x] 1.1 In `supabase/functions/ai-handler/index.ts`, extract the JWT from the `Authorization` header by removing the `Bearer ` prefix.
- [x] 1.2 Update the `supabaseClient.auth.getUser()` call in `index.ts` to pass the extracted JWT (`supabaseClient.auth.getUser(jwt)`).

## 2. Verification

- [x] 2.1 Verify the Edge Function locally if possible or review the code to ensure it matches the Supabase GoTrue expected pattern.
