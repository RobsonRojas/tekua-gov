## 1. Database Schema

- [x] 1.1 Run Supabase SQL to create the `jr_chat_messages` table and its RLS policies (allow users to select and insert only their own messages).
- [x] 1.2 Run `npx supabase gen types typescript --local > src/types/supabase.ts` (ou similar) para atualizar os tipos TypeScript.

## 2. Frontend Integration

- [x] 2.1 In `src/components/JusticaRestaurativa/AgenteChat.tsx`, add a `useEffect` to fetch the chat history for the current user from the `jr_chat_messages` table when the component mounts, and set it to the `messages` state.
- [x] 2.2 In `AgenteChat.tsx`, modify `handleSend` to save the user's new message to `jr_chat_messages` before invoking the AI agent.
- [x] 2.3 In `AgenteChat.tsx`, modify `handleSend` to save the agent's completed response to `jr_chat_messages` after the stream finishes successfully.
- [x] 2.4 In `AgenteChat.tsx`, ensure that only a limited number of recent messages (e.g., last 20) are sent to `chatWithJRAgent` to prevent context length errors, while keeping all messages in the UI.

## 3. Validation

- [x] 3.1 Run `npm run build` to verify that all React components build successfully.
