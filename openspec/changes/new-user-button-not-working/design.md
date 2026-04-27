## Context

The "Novo Membro" button in the Admin Panel is currently a placeholder without any implementation. The system needs a way for administrators to add new members to the association. Since we use Supabase for authentication, we can leverage the Admin API to invite users by email.

## Goals / Non-Goals

**Goals:**
- Implement a backend action to invite new users via email.
- Create a frontend modal for administrators to enter user details.
- Integrate the modal into the existing Admin Panel.

**Non-Goals:**
- Implementing a full invitation management dashboard (e.g., viewing pending invitations).
- Supporting bulk user uploads.

## Decisions

### 1. Invitation Flow via Edge Function
We will add an `inviteMember` case to the `api-members` edge function. This action will use the Supabase `auth.admin.inviteUserByEmail` method. This requires the `service_role` client which is already initialized in the edge function.

**Rationale**: Centralizing administrative member actions in a single edge function simplifies the security model (admin check is done once) and keeps the client code clean.

### 2. New Component: `NewMemberModal`
A new component will be created at `src/components/admin/NewMemberModal.tsx`. It will use MUI `Dialog` to match the project's design language.

**Fields**:
- Email (required)
- Full Name (optional, can be updated by the user later)
- Role (Member or Admin)

### 3. State Management in `AdminPanel.tsx`
We will use a simple `isNewMemberModalOpen` state in `AdminPanel.tsx`. 

**Rationale**: Given the current architecture of `AdminPanel.tsx`, adding a local state for the modal is the least complex approach and maintains the pattern used in other parts of the application.

## Risks / Trade-offs

- **[Risk]** → Invite email delivery. 
- **[Mitigation]** → This depends on the Supabase project configuration. We should ensure the admin is notified if the invitation fails.
- **[Trade-off]** → Invitation vs. Direct Creation.
- **[Decision]** → Invitation is safer as it forces the user to verify their email and set their own password.
