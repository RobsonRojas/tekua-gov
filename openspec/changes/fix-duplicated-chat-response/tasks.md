## 1. Fix Frontend Message Appending

- [x] 1.1 In `src/components/JusticaRestaurativa/AgenteChat.tsx`, modify the `if (event.type === 'text_chunk' || event.type === 'text_complete')` block in the `handleSend` function.
- [x] 1.2 Change it so that `event.type === 'text_chunk'` continues to append to `assistantResponse`, but `event.type === 'text_complete'` replaces `assistantResponse` (or is ignored if not needed) to prevent duplicating the message string.

## 2. Validation

- [x] 2.1 Verify that the React components build successfully (`npm run build`).
