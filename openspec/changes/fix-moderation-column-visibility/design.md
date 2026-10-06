## Context

See proposal.md for motivation. Current state: the "Moderação" column in the work wall is only rendered when the logged-in user is admin or transversal council (check via `isCouncilOrAdmin`), and the backend GET endpoint filters out tasks with status `pending_approval` for non-owners. Regular members therefore cannot see or suggest edits on tasks awaiting moderation.

## Goals / Non-Goals

**Goals:**
- Display the "Moderação" column to all active members, regardless of role, enabling viewing and editing of tasks/demands.
- Keep approve/reject actions restricted to `admin` and `transversal_council`, validated on the backend via the profile `roles` array.
- Ensure pending_approval tasks are returned by the work API for all users, while `rejected` tasks remain hidden.

**Non-Goals:**
- Changing how roles are assigned or managed.
- Allowing regular members to approve or reject moderations.
- Changes to the transversal council's formal decision workflow beyond visibility.

## Decisions

- **Role check on the frontend via the profile `roles` array**: the work wall reads the logged user's profile (JWT/`user.roles`) to decide which actions to render — edit controls for everyone, approve/reject only for `admin`/`transversal_council`.
  - Alternatives considered: (a) an `adminOnly` prop carried through the components — rejected because it hides the whole column from members; (b) server-only enforcement with a disabled UI — rejected because members need the editing affordances visible.
- **Visibility in the API by default**: remove the owner/pending_approval filter in `supabase/functions/api-work/index.ts` so GET returns `pending_approval` tasks to all users; keep `rejected` hidden.
  - Alternatives considered: a dedicated moderation endpoint — rejected as unnecessary duplication of the work resource.
- **Backend as the source of truth for approval**: even though the UI hides approve/reject for regular members, the edge function must still enforce the role check; the frontend gate is only UX, not security.
  - Alternatives considered: relying only on UI hiding — rejected as insecure.
- **RLS validation**: Supabase RLS policies and edge routes validate that only `admin`/`transversal_council` perform moderation approval; any active member may create edits/demands.

## Risks / Trade-offs

- **Increased exposure of pending tasks data to all members** → Mitigate by keeping `rejected` filtered and ensuring RLS restricts sensitive fields; members can see pending tasks but cannot approve them.
- **UI inconsistency if a role check is missed in one component** → Centralize the role check in one place and cover with typecheck/build plus manual verification.
- **Regular members attempting approval via direct API calls** → Must be blocked server-side with a Forbidden error; added scenario in the specs.
