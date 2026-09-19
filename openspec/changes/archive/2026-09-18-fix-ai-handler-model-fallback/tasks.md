## 1. Edge Function Fixes

- [x] 1.1 In `supabase/functions/ai-handler/index.ts`, modify the conversation history processing to ensure the first message always has the `role: 'user'`.
- [x] 1.2 In `supabase/functions/ai-handler/index.ts`, fetch the default AI model from the settings table (or use a hardcoded default like 'gemini-1.5-flash' initially) and define a list of fallback models.
- [x] 1.3 In `supabase/functions/ai-handler/index.ts`, wrap the Gemini API call in a loop/try-catch to iterate through the fallbacks if the primary model throws an error.
- [x] 1.4 In `supabase/functions/ai-handler/index.ts`, return a friendly and informative JSON error response to the client if all models fail to respond.

## 2. Admin Panel Configuration

- [x] 2.1 Investigate the database to locate the global settings table or decide to create a new key-value pair for the default AI model.
- [x] 2.2 In the Admin Panel frontend (`src/pages/admin/...` or similar), add a UI input (e.g., a select dropdown) to choose the default AI model.
- [x] 2.3 Wire up the new Admin Panel UI to save the selected model to the database using Supabase client.

## 3. Verification

- [x] 3.1 Test the `ai-handler` edge function by simulating a conversation where the first message comes from the `model` to ensure it doesn't crash.
- [x] 3.2 Test the fallback mechanism by passing an invalid model name first and observing if the second model takes over successfully.
- [x] 3.3 Verify that the Admin Panel can read and update the default AI model setting.
