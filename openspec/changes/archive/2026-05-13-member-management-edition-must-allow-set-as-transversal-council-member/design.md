## Context

The Transversal Council role was recently added to the system to moderate tasks on the Work Wall. While the role exists in the database and the backend supports it, the admin interface for managing members still relies on a generic multi-select roles field. This design proposes a dedicated toggle for the Transversal Council role to match the user experience of managing board members (Diretoria).

## Goals / Non-Goals

**Goals:**
- Provide a dedicated, prominent UI element (toggle) for assigning members to the Transversal Council.
- Maintain consistency with the existing "Membro da Diretoria" configuration.
- Ensure the `roles` array is correctly synchronized with the toggle state.

**Non-Goals:**
- Redesigning the entire member management system.
- Adding new database columns (staying with the modern `roles` array approach).

## Decisions

- **Decision: Toggle UI in MemberEditModal**
  - **Rationale**: A toggle is more intuitive for a binary status like "Council Member" than selecting from a list of roles. It matches the existing "Membro da Diretoria" pattern.
  - **Alternatives**: Keeping the multi-select (already dismissed as less intuitive).

- **Decision: Role Synchronization**
  - **Rationale**: The `transversal_council` role is the source of truth for permissions. The toggle will act as a convenient view/editor for this specific role in the `roles` array.
  - **Implementation**: 
    - `isTransversalCouncil` state in the React component.
    - On save, update the `roles` array by adding/removing `transversal_council`.

## Risks / Trade-offs

- **Risk**: Desynchronization between `role` (legacy single-string field) and `roles` (array).
  - **Mitigation**: The `MemberEditModal` already handles this mapping. We will ensure the `role` field is updated consistently with the current hierarchy (admin > transversal_council > member).
