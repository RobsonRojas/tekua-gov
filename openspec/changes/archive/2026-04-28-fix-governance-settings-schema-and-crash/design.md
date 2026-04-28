## Context

The Governance module is currently blocked by a missing database table and a frontend crash. The `api-governance` Edge Function expects a `governance_settings` table to manage parameters like voting thresholds, but this table was never created. Additionally, the `ReactQuill` editor used in the `Voting.tsx` page is incompatible with React 19 because it relies on `ReactDOM.findDOMNode`, which has been removed.

## Goals / Non-Goals

**Goals:**
- Initialize the `governance_settings` database table.
- Resolve the React 19 crash in the `Voting` page.
- Ensure the `api-governance` Edge Function handles missing settings gracefully.

**Non-Goals:**
- Implementing new governance rules or parameters (this is about fixing infrastructure).
- Redesigning the Governance UI.

## Decisions

### 1. Database Schema: Singleton Settings
- **Decision**: Create a `governance_settings` table where a single row with `id = 'current'` holds the system-wide configuration.
- **Rationale**: Governance settings are typically global. Using a singleton record simplifies queries and updates while allowing for future expansion if multiple configurations are needed.

### 2. Frontend: Replace ReactQuill with compatible editor
- **Decision**: Replace `react-quill` with a more modern, React 19 compatible alternative like `Tiptap` or a simplified markdown editor, OR wrap `ReactQuill` in a way that suppresses the `findDOMNode` error if possible.
- **Decision (Final)**: Since the project already uses `react-markdown`, we will use a simpler `TextField` with markdown support or a verified React 19 compatible editor to minimize bundle size and complexity.
- **Alternative**: Fix `ReactQuill` using a polyfill or legacy bridge, but this is discouraged for long-term stability.

### 3. Edge Function Stability
- **Decision**: Update `api-governance` to return default settings if the `governance_settings` table is empty, rather than throwing an error.

## Risks / Trade-offs

- **Risk**: Migrating existing data if `governance_settings` already had partial records in some environments.
  - **Mitigation**: Use `INSERT INTO ... ON CONFLICT DO NOTHING` in the migration to avoid errors.
- **Risk**: Learning curve for a new rich text editor.
  - **Mitigation**: Choose an editor with a similar API or stick to basic text/markdown for the immediate fix.
