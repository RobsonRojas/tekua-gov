## Context

Task interactions (comments) are an essential tool for communication on the Work Wall. Currently, users cannot tag/notify specific people. This change introduces user mentions in comments to proactively notify participants via in-app notifications and email.

## Goals / Non-Goals

**Goals:**
- Allow users to type `@` followed by a name in `TaskInteractions` to search and mention users.
- Submit the mentioned user IDs alongside the comment text to the backend.
- Create an in-app notification for each mentioned user.
- Send an email notification to each mentioned user.

**Non-Goals:**
- Implementing a full rich-text editor (we will keep the existing MUI `TextField` and layer a mention dropdown over it).
- Overhauling the existing notification or email architecture (we will use existing edge functions or RPCs).

## Decisions

**1. Frontend Mention Component (`TaskInteractions.tsx`)**
- We will implement a custom mention parser over the existing `TextField`.
- When the user types `@`, it will extract the subsequent characters as a search query.
- A MUI `List` or `Menu` (Popover) will appear anchored to the input (or nearby) displaying matched users.
- Selecting a user will replace the query with `@NomeDoUsuario ` and push the user's ID to a `mentionedUsers` state array.
- The `postInteraction` API payload will be updated to include an array of `mentionedUserIds`.

**2. Backend Notification & Email Handling**
- We will update the `api-work` edge function (or create a DB trigger/RPC depending on the current `postInteraction` implementation).
- Upon inserting the `task_interactions` record, the backend will iterate through the provided `mentionedUserIds`.
- For each user:
  1. Create a record in the `notifications` table (`type: 'mention'`, `reference_id: interaction.id`).
  2. Invoke the email service (Resend via Edge Function) to send a "You were mentioned" email.

## Risks / Trade-offs

- **Risk:** Calculating the exact cursor position in a plain `<textarea>` to position the dropdown is complex without third-party libraries.
  - *Mitigation:* We will position the mention dropdown simply below the `TextField` when an active mention search is occurring. It's less precise but highly robust and avoids adding new dependencies.
- **Risk:** A user could manipulate the `mentionedUserIds` array on the client to send spam notifications.
  - *Mitigation:* The backend can perform a simple validation to ensure the submitted IDs actually appear as `@Name` in the text content before sending emails.
