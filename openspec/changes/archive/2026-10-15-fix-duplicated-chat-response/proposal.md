## Why

The Restorative Justice AI chat currently displays duplicated responses. This happens because the edge function (`ai-justica-restaurativa`) streams the response in chunks (`text_chunk`) and then sends the full text again at the end (`text_complete`). The frontend `AgenteChat` component incorrectly appends both the chunks and the final complete text to the message string, resulting in the message appearing twice.

## What Changes

- Modify `AgenteChat.tsx` to handle `text_chunk` and `text_complete` correctly.
- `text_chunk` will continue to append to the running `assistantResponse` string.
- `text_complete` will replace the `assistantResponse` instead of appending to it (or will be ignored if appending is sufficient), preventing the duplication of the full message.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- `src/components/JusticaRestaurativa/AgenteChat.tsx` will be modified.
- The user experience will be fixed by displaying the AI's response exactly once, correctly streamed.
