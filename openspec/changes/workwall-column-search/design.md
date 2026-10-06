## Context

See proposal.md - Why. WorkWall columns currently list all items for their statuses without any per-column filtering.

## Goals / Non-Goals

**Goals:**
- Independent search input per column filtering that column's items by title.

**Non-Goals:**
- Global cross-column search, backend/API changes, or filter persistence.

## Decisions

- **Per-column local state**: a map columnId -> search text held in WorkWall, filtering `getColumnActivities` results case-insensitively on the resolved title. Alternative: single shared search box — rejected because the request is per column.
- **Client-side filtering**: items are already loaded; no API change needed.

## Risks / Trade-offs

- Title stored as localized object (`title.pt`/`title.en`) → resolve with the same logic used elsewhere (lang fallback to pt).
