## Context

The current system uses a single `role` column (enum/text) and separate `is_board_member` (boolean) and `board_role` (text) columns in the `profiles` table. This prevents members from holding multiple positions simultaneously, such as being an administrator while also acting as a regular member for task participation, or holding multiple board seats and council positions.

## Goals / Non-Goals

**Goals:**
- Enable members to have multiple roles (platform access levels).
- Enable members to have multiple organizational functions/titles.
- Update security policies (RLS) to support multi-role validation.
- Update UI to manage and display multiple roles/functions.

**Non-Goals:**
- Implementing hierarchical role inheritance (e.g., Admin automatically inheriting Member permissions) - roles should be explicitly assigned.
- Changing the underlying authentication provider (Supabase Auth).

## Decisions

### 1. Data Model: Array Columns in `profiles`
We will replace the single `role` and `board_role` columns with array columns.
- **Rationale**: Postgres native `text[]` arrays are efficient for small collections, support easy "contains" queries using `@>` and `ANY()`, and avoid the complexity of additional join tables for simple tag-like roles.
- **Schema Changes**:
  - `role` (text) → `roles` (text[])
  - `board_role` (text) → `functions` (text[])
- **Alternatives considered**:
  - Join table (`profile_roles`): More normalized but adds query complexity and overhead for what is essentially a small set of attributes.
  - JSONB: Flexible but slightly more complex syntax for simple membership checks.

### 2. Unified RBAC Logic
Access checks in SQL and TypeScript will be updated to check if a required role exists within the user's role array.
- **SQL (RLS)**: `auth.uid() IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))` or using the `@>` operator.
- **TypeScript**: `profile.roles.includes('admin')`.

### 3. Migration Strategy
To avoid downtime and breaking changes during migration:
1.  Add new columns `roles` and `functions` with default empty arrays.
2.  Populate new columns from old columns:
    - `roles` = `ARRAY[role]`
    - `functions` = `CASE WHEN is_board_member THEN ARRAY[board_role] ELSE ARRAY[]::text[] END`
3.  Update application code to use new columns.
4.  Drop old columns in a follow-up migration.

## Risks / Trade-offs

- **Risk**: Performance of RLS policies with array checks.
  - **Mitigation**: Use GIN indexes on the array columns if the member count grows significantly. At the current scale, `ANY()` on a small array is negligible.
- **Risk**: UI complexity in member management.
  - **Mitigation**: Use multi-select chips or a checkbox list in the member edit dialog.
- **Trade-off**: Breaking change for external queries or direct database access.
  - **Mitigation**: Provide clear documentation and potentially a view that mirrors the old structure during the transition period.

## Open Questions

- Should we strictly enforce a set of roles (enum-like) in the array, or allow arbitrary strings for functions?
  - *Recommendation*: Enforce platform roles ('admin', 'member', 'transversal_council') via a check constraint on the array, but allow arbitrary strings for 'functions'.
