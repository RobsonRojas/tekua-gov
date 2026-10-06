## Context

See proposal.md - Why. The tasks board currently relies on filters; cards may not prominently show the task title, and there is no free-text search.

## Goals / Non-Goals

**Goals:**
- Show task title on each board card.
- Add a client-side search input filtering tasks by title/description, combined with existing filters.

**Non-Goals:**
- Server-side search or new API endpoints.
- Changing board layout/roles/permissions.

## Decisions

- **Client-side filtering**: Search filters the already-loaded task list by case-insensitive match on title/description. Alternative: backend search query — rejected as unnecessary for current data volumes and to avoid API changes.
- **Reuse existing filter UI area** where possible for consistent styling.
- **Title rendered on card** using existing typography/card styles.

## Risks / Trade-offs

- Cards may look busier → Mitigate with proper typography hierarchy and truncation for long titles.
