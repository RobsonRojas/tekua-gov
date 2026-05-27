## Context

Currently, participation in tasks and challenges is limited to existing members of the Tekuá platform. To increase engagement and acquire new users, administrators need a mechanism to invite external people to specific tasks. These invited users should easily sign up and be immediately associated with the task, earning Surreais (the platform currency) upon completion.

## Goals / Non-Goals

**Goals:**
- Provide a UI for admins to generate an invitation link and a QR code for any task.
- Create an onboarding flow where external users can scan the QR code or click the link, register for an account, and automatically join the associated task.
- Ensure the user is properly rewarded with Surreais after the task is completed and approved.

**Non-Goals:**
- Changing the fundamental structure of tasks or how they are executed by existing users.
- Implementing generic non-task invites (this is strictly tied to tasks/challenges).

## Decisions

- **Invite Links & Tokens:** 
  - Instead of a complex database table, we will add an `invite_token` (UUID) field to the tasks table (or generate it deterministically/on-the-fly if preferred, but storing a unique token ensures revocability).
  - The link will follow the format `/invite/task/:inviteToken`.

- **QR Code Generation:**
  - We will use a standard React library like `qrcode.react` to render the QR code dynamically on the task detail page for admins.
  - The QR code will encode the full URL of the invite link.

- **Onboarding Flow:**
  - The `/invite/task/:inviteToken` route will display a landing page explaining the task and the reward.
  - Clicking "Accept Challenge" will redirect to the signup page with a `?task_invite=:inviteToken` query parameter.
  - Upon successful registration, the backend will automatically add the user as a participant to the task associated with the token.

- **Reward Mechanism:**
  - The existing task completion flow will handle the Surreal reward, as the user will simply be a standard participant of the task.

## Risks / Trade-offs

- **Risk: Spam signups.** 
  - Mitigation: Captcha on the signup page and requiring admin approval for task completion before any Surreais are minted/awarded.
- **Risk: Link sharing beyond intended audience.**
  - Mitigation: This is generally a feature, not a bug, as it drives user acquisition. However, task participant limits can be enforced if a task shouldn't have too many participants.
