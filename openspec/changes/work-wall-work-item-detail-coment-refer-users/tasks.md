## 1. Frontend: Mention Search UI

- [x] 1.1 In `src/components/work/TaskInteractions.tsx`, update the comment `TextField` state to track if the user is currently typing a mention (e.g., detected `@` and subsequent characters).
- [x] 1.2 Implement a fetch logic or use existing members API (`api-members`, `fetchUsers`) to get a list of available users for the mention dropdown.
- [x] 1.3 Create a dropdown UI (`Popover` or absolute-positioned `List`) that displays the filtered users when a mention is being typed.
- [x] 1.4 Handle user selection: replace the typed mention query with the selected user's name and store their ID in a new state array `mentionedUserIds`.

## 2. Backend API Update

- [x] 2.1 Update the `postInteraction` call in `TaskInteractions.tsx` to include `mentionedUserIds` in the payload.
- [x] 2.2 In the Supabase edge function `api-work` (or corresponding RPC for posting interactions), update the logic to accept `mentionedUserIds`.
- [x] 2.3 For each ID in `mentionedUserIds`, insert a record into the `notifications` table linking to the activity and the new interaction.

## 3. Email Notifications

- [x] 3.1 In the same edge function/RPC (or via a database trigger on the `notifications` table), integrate the existing email service (Resend) to dispatch an email to each mentioned user.
- [x] 3.2 Ensure the email contains the task title, the comment content, and a link directly to the task.
