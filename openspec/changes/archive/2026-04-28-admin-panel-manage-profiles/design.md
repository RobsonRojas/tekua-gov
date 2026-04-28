## Context

The system currently uses a simple binary role system (Admin/Member). Philosophical societies and similar organizations operate with a board (Diretoria) that has specific functional roles (President, Treasurer, etc.). This change introduces the capability to manage and display these roles within the platform.

## Goals / Non-Goals

**Goals:**
- Extend the `profiles` schema to support board membership and specific roles.
- Update the Admin Panel to allow role assignment.
- Ensure roles are visible on profiles and member lists.
- Include a curated list of roles relevant to philosophical societies.

**Non-Goals:**
- Implementing RBAC (Role-Based Access Control) specifically for board roles (e.g., only the Treasurer can access financial reports). Board roles will be primarily for display and identification in this phase.

## Decisions

1. **Schema Extension**:
   - Add `is_board_member` (BOOLEAN, default FALSE) to the `profiles` table.
   - Add `board_role` (TEXT, nullable) to the `profiles` table.
   - *Rationale*: Storing these directly in the profiles table simplifies queries for the member directory and profile pages without requiring complex joins.

2. **Predefined Roles**:
   - Create a constant list of roles: Presidente, Vice-Presidente, Secretário, Tesoureiro, Membro da Diretoria, Conselho Fiscal, Diretor Acadêmico, Diretor de Eventos, Diretor de Comunicação, Bibliotecário, Orador.
   - *Rationale*: Provides a consistent set of options for administrators while meeting the user's research requirement.

3. **UI/UX Updates**:
   - **Admin Member List**: Add a column or badge indicating board status and role.
   - **Member Edit Modal**: Add a toggle for "Membro da Diretoria" and a conditional select for the specific cargo.
   - **User Profile**: Display the board position prominently.

## Risks / Trade-offs

- **[Risk] Multiple Roles** → Some members might hold multiple positions (e.g., Secretary and Librarian). 
  - *Mitigation*: The `board_role` will be stored as TEXT. While the UI will provide a single-select for simplicity, the database could eventually support arrays if needed. For now, a single main role is the target.
- **[Trade-off] Simple Display vs. Permissions** → We are not adding new permissions yet.
  - *Rationale*: The user requested "managing profiles" and "assigning roles", not updating the entire permission system.

## Migration Plan

1. SQL migration to add columns to `profiles`.
2. Update Typescript interfaces for Profile.
3. Update `useMembers` hook (if necessary) to handle new fields.
4. Update `MemberEditModal` component.
5. Update Profile view components.
